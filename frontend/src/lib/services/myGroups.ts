

import { publicClient } from '@/lib/viem';
import { 
    CONTRACT_ABI as FULL_CONTRACT_ABI, 
    CONTRACT_ADDRESS as RAW_CONTRACT_ADDRESS,   
} from '@/lib/contract';
import { 
    type Address,
    type Abi, 
} from 'viem';
/*
import { getWalletClient } from '@/lib/viem';
import {
    type Hex,
    type Hash,  
    type Address,
    type Log,
    type Abi,
    type AbiEvent,
    type TransactionReceipt, 
    BaseError as ViemBaseError,  
    decodeEventLog,
    keccak256,
    stringToBytes,
    parseAbiItem,
    getEventSelector,  
    DecodeEventLogReturnType,  
} from 'viem';
*/
export interface GroupDetailsFromContract {
    id: bigint;
    name: string;
    creator: Address;
    isActive: boolean;
}

// --- TYPE DEFINITIONS ---
 
const CONTRACT_ADDRESS: Address = RAW_CONTRACT_ADDRESS as Address;
const CONTRACT_ABI = FULL_CONTRACT_ABI as Abi;


// --- FUNCTION TO GET ALL GROUPS ---

export async function getAllExistingGroups(): Promise<GroupDetailsFromContract[]> {
    try {
        const nextGroupIdRaw = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'nextGroupId',
        });
        const nextGroupId = typeof nextGroupIdRaw === 'bigint' ? nextGroupIdRaw : BigInt(String(nextGroupIdRaw));

        if (nextGroupId === BigInt(0)) {
            console.log("No groups created yet (nextGroupId is 0).");
            return [];
        }

        const groupsPromises: Promise<GroupDetailsFromContract | null>[] = [];

        for (let i = BigInt(0); i < nextGroupId; i = i + BigInt(1)) {
            const groupIdToFetch = i;
            groupsPromises.push(
                publicClient.readContract({
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: 'groups', // Esta función, según la ABI, devuelve 4 campos
                    args: [groupIdToFetch],
                }).then(groupDataTuple => {
                    // groupDataTuple según la ABI será: [id, name, creator, isActive]
                    if (!Array.isArray(groupDataTuple) || groupDataTuple.length < 4) {
                        console.warn(`Received unexpected data structure for group ID ${groupIdToFetch.toString()}:`, groupDataTuple);
                        return null;
                    }

                    const idRaw = groupDataTuple[0];
                    const name = groupDataTuple[1] as string;
                    const creator = groupDataTuple[2] as Address;
                    const isActive = groupDataTuple[3] as boolean;

                    // Si creator es address(0), el grupo probablemente no existe o es un slot vacío.
                    if (creator === '0x0000000000000000000000000000000000000000') {
                        return null;
                    }
                    
                    const id = typeof idRaw === 'bigint' ? idRaw : BigInt(String(idRaw));

                    // El ID interno del struct debe coincidir con el ID que consultamos
                    if (id !== groupIdToFetch) {
                         console.warn(`Mismatch in group ID for fetched ID ${groupIdToFetch.toString()}. Struct ID: ${id.toString()}`);
                         return null;
                    }

                    return {
                        id,
                        name,
                        creator,
                        isActive,
                    };
                }).catch(error => {
                    console.error(`Error fetching group with ID ${groupIdToFetch.toString()}:`, error);
                    return null;
                })
            );
        }

        const resolvedGroups = await Promise.all(groupsPromises);
        return resolvedGroups.filter(group => group !== null) as GroupDetailsFromContract[];

    } catch (error) {
        console.error('Error in getAllExistingGroups service:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to fetch all groups: ${error.message}`);
        }
        throw new Error('An unknown error occurred while fetching all groups.');
    }
}

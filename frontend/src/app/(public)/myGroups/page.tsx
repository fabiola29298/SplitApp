'use client'; 
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 

import React from "react";
import GroupsCardList from "./components/groupsCardList"; 
import Link from 'next/link';


function LoadingComponent() {
    return <p className="text-white">Cargando datos del usuario y rol...</p>;
}

export default function MyGroupsPage() {
    const { ready, authenticated, user, logout } = usePrivy();
    const router = useRouter();
 
    const [isLoadingRole, setIsLoadingRole] = useState<boolean>(true);

    useEffect(() => {
        if (ready && !authenticated) {
            router.push('/');
        }
        if (ready && authenticated && user?.wallet?.address) {
            setIsLoadingRole(true);

            
        } else if (ready && authenticated && !user?.wallet?.address) {
            console.warn("Usuario autenticado pero sin dirección de wallet.");
            
            setIsLoadingRole(false);
        }
    }, [authenticated, router, ready, user?.wallet?.address]);
    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (!ready || (authenticated && isLoadingRole === null) ) {
        return <LoadingComponent />;
    }

    if (!authenticated && ready) {  
        return (
            <div>
                <p>Por favor, inicia sesión para acceder a la Dapp.</p>
                  
            </div>
        );
    }

    
    if (authenticated !== null) {
        return (
            <>
                <div className="relative w-full min-h-screen   overflow-hidden  ">
             
                    {/* Main container */}
                    <div className="flex justify-center items-center px-4 py-4">

                        {/* Main content */}
                        <main className="w-full max-w-[824px] bg-[#00000040]/70 border-none rounded-[26px] overflow-hidden p-10 ">
                            {/* Card */}
                            <div className='p-5 text-white'>
                            <p  >Welcome {user?.wallet?.address} </p>
                            <button onClick={handleLogout}>Logout</button>
                
                            </div>
                            <div className="flex justify-between">
                            <h3 className="text-2xl text-white">Group List</h3>
                    
                            <Link href={"/createGroup"}>
                            <p className="text-[#64D5E4] p-2"> <span> Add new group</span> </p>
                                    </Link>
                            </div>
                    
                            {/* Expenses Card */}
                            <GroupsCardList/>
            
                        </main>
                    </div>
                </div>
            </>
        );
    }
    if (!authenticated) return null;


    return <LoadingComponent/>;
}

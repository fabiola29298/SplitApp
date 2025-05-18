 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Users, ChevronRight, Loader2, AlertTriangle } from "lucide-react"; 
import Link from 'next/link';


import React, { useEffect, useState } from "react";
import { getAllExistingGroups, type GroupDetailsFromContract } from '@/lib/services/myGroups'; 

 

export default function GroupsCardList() {
    const [groups, setGroups] = useState<GroupDetailsFromContract[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGroups = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedGroups = await getAllExistingGroups();
                setGroups(fetchedGroups);
            } catch (e: unknown) {
                let errorMessage = "Failed to load groups. Please try again.";
                if (e instanceof Error) {
                    errorMessage = e.message;
                }
                setError(errorMessage);
                console.error("Error fetching groups for card list:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, []); // Cargar solo una vez al montar

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-white">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-lg">Loading groups...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-red-400 bg-[#12131A] p-6 rounded-lg border border-red-500">
                <AlertTriangle className="w-12 h-12 mb-4" />
                <p className="text-lg font-semibold">Error Loading Groups</p>
                <p className="text-sm text-center">{error}</p>
                {/* Podrías añadir un botón de reintentar aquí */}
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="text-center py-10 text-white">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-xl">No groups found.</p>
                <p className="text-gray-400">Why not create one?</p>
                {/* Aquí podrías poner un Link o botón para crear un grupo */}
            </div>
        );
    }



    return (
        <div>
        {groups.map((group) => (
            <div key={group.id.toString()}>
        <Card className="my-5 w-full bg-[#12131A] border border-solid border-[#273345] rounded-[24px] text-white ">
            <CardContent className="flex flex-row items-center justify-between border-none border-[#273345] px-8 py-0">
                <div className="flex items-center gap-4">
                    <div className="rounded-[6px] flex items-center justify-center">
                        <Users className="w-10 h-10" />
                    </div>
                    <div className="inline">
                    <CardTitle className="font-paragraph-regular-16-medium pb-2 ">
                        {group.name}
                        </CardTitle>
                        <div className="bg-[#273345] w-fit px-3 py-1 rounded-2xl text-xs">
                        2 Friends
                        </div>
                    </div>
                    
                </div>
                <div className="flex gap-2">
                <Link href={"/dashboard"}>
                <Button
                                variant="outline"
                                className="rounded-full text-xs border bg-[#191D26] border-[#273345]"
                            >
                                Open  
                                <ChevronRight />
                            </Button> 
                </Link>
                    
                </div>
            </CardContent>
 
        </Card></div>
        ))}
    </div>
    )
}
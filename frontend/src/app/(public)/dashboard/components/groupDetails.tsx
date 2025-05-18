 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ChevronLeft, User, Banknote  } from "lucide-react";
import React from "react";
import Link from 'next/link';
// Define data for members
const members = [
    { name: "You", address: "0x8F85B6eC0C671B39871c03ACe99712b9e403204B" },
    { name: "Camila", address: "0x7496E003D30D861A8922AFfDDd98Ca0FF2a04A5a" },
    { name: "Camila", address: "0xF94a41193938Ab56b17697B1A7D76F8668f3C65C" },
];

 

export default function GroupDetails() {
    return (
        <Card className="w-full max-w-[695px] bg-[#12131A] mb-10 border border-solid border-gray-600 rounded-[24px] text-white ">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-600  px-8 py-6">
            <div className="w-full flex  justify-between flex-wrap ">
            <div className="flex gap-2">
                <Link href={"/myGroups"}>
                        <div className="flex pb-3">
                            <ChevronLeft className="h-4"/>
                            <span className="text-xs">Back</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-[54px] h-[49px]   rounded-[6px] flex items-center justify-center">
                                <Users className="w-10 h-10" />
                            </div>
                            
                            <CardTitle className="font-paragraph-regular-16-medium ">
                            <span className="text-xs text-gray-400 font-normal">Group Name</span><br/> 
                            Cousin Crew
                            </CardTitle>
                        </div>
                    </Link>
            </div>
            <div className="flex gap-2 flex-col py-3">
                        <Link href={"/createExpense"}>
                        <Button
                                variant="outline"
                                className="rounded-full text-xs border  (--01-tokens-components-button-secondary-border)] bg-01-tokens-components-button-secondary-background"
                            >
                               <Banknote/> Add expense
                            </Button>
                        </Link>
                        <Link href={"/createGroup"}>
                        <Button
                                variant="outline"
                                className="rounded-full text-xs border border-[color:var(--01-tokens-components-button-secondary-border)] bg-01-tokens-components-button-secondary-background"
                            >
                                    <User/>  Add members
                                </Button>
                        </Link>
                
                
            </div>
            </div>
            
        </CardHeader>

        <CardContent className="px-8 py-1" >
            <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400 font-normal">
                    Members:
                </p>
                {members.map((member, index) => (
                    <div className="flex" key={index}>
                        <User/> 
                        <p
                            key={index}
                            className="font-paragraph-small-14-regular text-01-tokens-text-secondary"
                        >
                             {member.name}: {member.address}
                        </p>
                         
                    </div>
                    
                ))}
            </div>
        </CardContent>
    </Card>
    )
}
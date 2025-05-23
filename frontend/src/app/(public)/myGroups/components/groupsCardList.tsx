 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Users, ChevronRight  } from "lucide-react"; 
import React from "react";
import Link from 'next/link';
// Define data for members
const groups = [
    { key: "1", name: "Downtown Apartment", people: "3" },
    { key: "2", name: "Family",  people: "5" },
    { key: "3", name: "Colombia Trip",  people: "3" },
];

 

export default function GroupsCardList() {
    return (
        <div>
        {groups.map((group) => (
            <div key={group.key}>
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
                        {group.people} Friends
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
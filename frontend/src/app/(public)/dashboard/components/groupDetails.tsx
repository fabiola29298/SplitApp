 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ChevronLeft  } from "lucide-react";
import React from "react";
import Link from 'next/link';
// Define data for members
const members = [
    { name: "You", address: "0x0000" },
    { name: "Camila", address: "0x0000" },
    { name: "Camila", address: "0x0000" },
];

 

export default function GroupDetails() {
    return (
        <Card className="w-full max-w-[695px] bg-[#12131A] mb-10 border border-solid border-gray-600 rounded-[24px] text-white ">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-600  px-8 py-6">
            <Link href={"/myGroups"}>
                <div className="flex pb-3">
                    <ChevronLeft className="h-4"/>
                    <span className="text-xs">Back</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-[54px] h-[49px]   rounded-[6px] flex items-center justify-center">
                        <Building2 className="w-10 h-10" />
                    </div>
                    <CardTitle className="font-paragraph-regular-16-medium ">
                        Downtown Apartment1
                    </CardTitle>
                </div>
            </Link>
            <div className="flex gap-2">
                    <Link href={"/createExpense"}>
                    <Button
                            variant="outline"
                            className="rounded-full text-xs border  (--01-tokens-components-button-secondary-border)] bg-01-tokens-components-button-secondary-background"
                        >
                            Add expense
                        </Button>
                    </Link>
                    <Link href={"/createGroup"}>
                    <Button
                            variant="outline"
                            className="rounded-full text-xs border border-[color:var(--01-tokens-components-button-secondary-border)] bg-01-tokens-components-button-secondary-background"
                        >
                            Add members
                            </Button>
                    </Link>
                
                
            </div>
        </CardHeader>

        <CardContent className="p-8">
            <div className="flex flex-col gap-1">
                <p className="font-paragraph-small-14-regular text-01-tokens-text-secondary">
                    Members:
                </p>
                {members.map((member, index) => (
                    <p
                        key={index}
                        className="font-paragraph-small-14-regular text-01-tokens-text-secondary"
                    >
                        {member.name}: {member.address}
                    </p>
                ))}
            </div>
        </CardContent>
    </Card>
    )
}
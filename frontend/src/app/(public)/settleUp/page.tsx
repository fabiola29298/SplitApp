import React from "react"; 

import { ChevronRight, ChevronLeft, User, LockKeyhole  } from "lucide-react";  
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 
export default function SettleUpPage() {
    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            {/* Main container */}
            <div className="flex justify-center items-center px-4 py-4">

                {/* Main content */}
                <main className="w-full max-w-[524px] bg-[#00000040]/70 border-none rounded-[26px] overflow-hidden p-10 ">
                    {/* Expense Card */}
                    <Card className="my-5 w-full bg-[#12131A] border border-solid border-[#273345] rounded-[24px] text-white ">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-[#273345] px-8 py-0">
                            <div className="flex items-center gap-4">
                                <div className="rounded-[6px] flex items-center justify-center">
                                    <ChevronLeft className="w-10 h-10" />
                                </div>
                                <CardTitle className="font-paragraph-regular-16-medium ">
                                Settle up
                                </CardTitle> 
                            </div>
                             
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <Label htmlFor="name" className="text-[16px] text-white pb-4">
                                <span className="text-gray-500">With  </span>
                                <span className="text-white"> you  </span>
                                <span className="text-gray-500"> and: </span>
                                All of Colombia Trip</Label>
                            <div className="flex flex-col gap-5 ">
                            
                             <div className="flex"> 
                                <div className="w-12 h-12 p-3 bg-[#4B5563] rounded-full ">
                                 <User/>
                                </div>
                                <div className="p-3  ">
                                 <ChevronRight/>
                                </div>
                                <div className="w-12 h-12 p-3 bg-[#4B5563] rounded-full ">
                                 <User/>
                                </div>

                             </div>
                            <div className="space-y-1 pb-2">
                                <p className="text-xs text-[#9CA3AF]"> Description</p>
                                <div className="flex">
                                    <p className="text-xl"> Taxi</p>
                                    <LockKeyhole className="ml-4"/>

                                </div>
                            </div>
                            <div className="space-y-1 pb-5">
                                <p className="text-xs text-[#9CA3AF]"> Amount ($MNT)</p>
                                <div className="flex">
                                    <p className="text-xl"> $MNT 2,50</p>
                                    <LockKeyhole className="ml-4"/>
                                </div>
                                
                            </div>
                                
                            </div>
                            <Button
                                variant="outline"
                                className="rounded-full text-xs border bg-[#191D26] border-[#273345] w-full"
                            >
                                Save  
                                <ChevronRight />
                            </Button> 
                        </CardContent>
 
                    </Card>
            
                </main>
            </div>
        </div>
    );
}

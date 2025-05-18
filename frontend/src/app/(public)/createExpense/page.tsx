import React from "react"; 

import { ChevronRight, ChevronLeft, LockKeyhole  } from "lucide-react";  
import Link from 'next/link';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Input } from "@/components/ui/input" 
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddExpenseForm from "./AddExpenseForm";
 
export default function CreateExpensePage() {
    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            {/* Main container */}
            <div className="flex justify-center items-center px-4 py-4">

                {/* Main content */}
                <main className="w-full max-w-[524px] bg-[#00000040]/70 border-none rounded-[26px] overflow-hidden p-10 ">
                    <AddExpenseForm/>
                    {/* Expense Card */}
                    <Card className="my-5 w-full bg-[#12131A] border border-solid border-[#273345] rounded-[24px] text-white ">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-[#273345] px-8 py-0">
                            <div className="flex items-center gap-4">
                                <div className="rounded-[6px] flex items-center justify-center">
                                    <Link href={"/dashboard"}>
                                    <ChevronLeft className="w-10 h-10" />
                                    </Link>
                                    
                                </div>
                                <CardTitle className="font-paragraph-regular-16-medium ">
                                Add an expense
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
                            
                            <div className="space-y-1">
                                <Label htmlFor="name" className="text-xs text-[#9CA3AF]">Description</Label>
                                <Input id="name" defaultValue="Taxi" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="wallet" className="text-xs text-[#9CA3AF]">Amount ($MNT)</Label>
                                <Input id="wallet" defaultValue="10" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="wallet" className="text-xs text-[#9CA3AF]">Paid by</Label>
                                <Select>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a way to paid" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Select a way to paid</SelectLabel>
                                      <SelectItem value="by-equally">Paid by you and split equally</SelectItem>
                                      <SelectItem value="by-exact-amount" disabled >Split by exact amount (coming soon in the next version) <LockKeyhole/> </SelectItem>
                                      <SelectItem value="by-percentages" disabled >Split by percentages (coming soon in the next version) <LockKeyhole/>  </SelectItem> 
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>

                            </div>
                            <div className="space-y-1 pb-5">
                                <p className="text-xs text-[#9CA3AF]"> Balance</p>
                                <p className="text-xl"> $MNT 2,50 / person</p>
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

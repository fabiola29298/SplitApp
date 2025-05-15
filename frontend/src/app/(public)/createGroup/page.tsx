import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input" 
import Link from 'next/link';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CirclePlus } from "lucide-react";

export default function Page() {
  return (
    
    <div className="relative w-full min-h-screen   overflow-hidden  ">
             
             {/* Main container */}
             <div className="flex justify-center items-center px-4 py-4">
         
                 {/* Main content */}
                 <main className="w-full max-w-[824px] flex justify-center items-center bg-[#00000040]/70 border-none rounded-[26px] overflow-hidden p-10 ">
                     {/* Apartment Card */}
                     <Tabs defaultValue="step1" className="w-[400px]">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="step1">Step 1</TabsTrigger>
                        <TabsTrigger value="step2">Step 2</TabsTrigger>
                      </TabsList>
                      <TabsContent value="step1">
                        <Card className="bg-[#12131A] text-white border-gray-600">
                          <CardHeader>
                            <CardTitle>Step 1: Create your first group</CardTitle>
                            <CardDescription>
                              Select an option. Click save when you&#39;re done.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                          <RadioGroup defaultValue="option-one">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="option-one" id="option-one" />
                                <Label htmlFor="option-one">My Apartment</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="option-two" id="option-two" />
                                <Label htmlFor="option-two">Friends group</Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="option-three" id="option-three" />
                                    <Label htmlFor="option-two">Group trip</Label>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="option-four" id="option-four" />
                                    <Label htmlFor="option-two">Family</Label>
                                  </div>
                            </RadioGroup>

                          </CardContent>
                          <CardFooter>
                            <Button className="bg-white text-black">Save</Button>
                          </CardFooter>
                        </Card>
                      </TabsContent>
                      <TabsContent value="step2">
                        <Card className="bg-[#12131A] text-white border-gray-600">
                          <CardHeader>
                            <CardTitle>Step 2: Add members</CardTitle>
                            <CardDescription>
                              Add members here. 
                            </CardDescription>
                            
                            
                          </CardHeader>
                          <CardContent className="space-y-2">

                          <div className="space-y-1">
                              <Label htmlFor="name">Member name</Label>
                              <Input id="name" defaultValue="Enter name" />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="wallet">Wallet address</Label>
                              <Input id="wallet" defaultValue="@0x...." />
                            </div>
                            <Button className="border-none bg-gray-600 text-white"> <CirclePlus /> Add new</Button>
                          </CardContent>
                          <CardFooter>
                          <Link href={"/dashboard"}>
                          <Button className="bg-white text-black">Save members</Button>
                            </Link>
                            
                          </CardFooter>
                        </Card>
                      </TabsContent>
                    </Tabs>
                     
                 </main>
             </div>
         </div>
  )
}

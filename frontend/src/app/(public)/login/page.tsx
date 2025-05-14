import React from "react";

import DetailsCard from "./components/detailsCard";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 

export default function LoginPage() {

    return (
        <main className="relative w-full min-h-screen   overflow-hidden ">     
            {/* Main content */}
            <div className="flex justify-center items-center px-4 py-4">
                <Card className="w-full max-w-[824px] bg-[#00000040]/70 border-none rounded-[26px] overflow-hidden">
                    {/* Hero section */}
                    <div className="flex flex-col items-center justify-center text-center py-4 px-6">
                        <h2 className="text-[40px] font-semibold text-[#43a047] mb-4">
                            Splitter Dapp
                        </h2>
                        <p className="text-white text-xl max-w-[484px] mb-8">
                            Keep track of your shared expenses and balances with housemates,
                            trips, groups, friends, and family.
                        </p>
                        <Button className="bg-[#43a047] text-white hover:bg-[#3b8f3f]">
                            Select Wallet
                        </Button>
                    </div>

                    {/* Details section */}
                    <DetailsCard/>
                     
                </Card>
            </div>
 
        </main>
    );
}

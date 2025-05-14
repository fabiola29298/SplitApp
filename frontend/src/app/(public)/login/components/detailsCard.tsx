import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"; 
import React from "react";

// Step data for the onboarding process
const steps = [
    {
        number: 1,
        title: "Create Your Group",
        description:
            "Set up a group for your household, trip, or event. Invite friends and family to join with just a few taps.",
    },
    {
        number: 2,
        title: "Add an Expense",
        description:
            "Record any shared expense in seconds. Split it evenly or customize how much each person owes.",
    },
    {
        number: 3,
        title: "Settle Up",
        description:
            "View balances at a glance and settle debts through the app with just one tap.",
    },
];

export default function DetailsCard() {
    return (
        <Card className="mx-auto mb-12 w-[90%] max-w-[725px] bg-[#12131A] border-none rounded-[24px] overflow-hidden text-white">
        <CardHeader className="border-b border-gray-600  pb-6">
            <CardTitle className="text-center text-[32px]">
                Get Started in 3 Simple Steps
            </CardTitle>
            <CardDescription className="text-center text-01-tokens-text-primary">
                Splitter Dapp makes sharing expenses incredibly easy. Here&#39;s how
                to get started:
            </CardDescription>
        </CardHeader>

        <CardContent className="pb-6">
            <div className="flex flex-col md:flex-row gap-4">
                {steps.map((step) => (
                    
                    <div
                        key={step.number}
                        className="flex-1 flex flex-col items-center"
                    >
                         
                        <div className="w-8 h-8 m-5 ">
                        <div className="w-6 pl-2 bg-[#4B5563] rounded-full ">
                        {step.number}</div>
                        </div>
                        <div className="w-full h-32 p-3 rounded-lg border relative">
                            <Badge className="text-[16px] absolute top-2.5 left-1/2 transform -translate-x-1/2   ">
                                {step.title}
                            </Badge>
                            <div className="flex items-center justify-center h-full pt-6">
                                <p className="text-[11px] text-center  ">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-8">
                <Button className="bg-[#43a047] text-white hover:bg-[#3b8f3f]">
                    Select Wallet
                </Button>
            </div>
        </CardContent>
    </Card>
    )
}
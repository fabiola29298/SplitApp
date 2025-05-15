 
import React from "react";
import GroupsCardList from "./components/groupsCardList"; 
import Link from 'next/link';
export default function Color() {
    return (
        <div className="relative w-full min-h-screen   overflow-hidden  ">
             
            {/* Main container */}
            <div className="flex justify-center items-center px-4 py-4">

                {/* Main content */}
                <main className="w-full max-w-[824px] bg-[#00000040]/70 border-none rounded-[26px] overflow-hidden p-10 ">
                    {/* Apartment Card */}
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
    );
}

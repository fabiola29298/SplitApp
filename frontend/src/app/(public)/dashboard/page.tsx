 
import React from "react";
import GroupDetails from "./components/groupDetails";
import ExpensesHistorial from "./components/expensesHistorial";
 
export default function Color() {
    return (
        <div className="relative w-full min-h-screen   overflow-hidden  ">
             
            {/* Main container */}
            <div className="flex justify-center items-center px-4 py-4">

                {/* Main content */}
                <main className="w-full max-w-[824px] bg-[#00000040]/70 border-none rounded-[26px] overflow-hidden p-10 ">
                    {/* Apartment Card */}
                    <GroupDetails/>
                    {/* Expenses Card */}
                    <ExpensesHistorial/>
            
                </main>
            </div>
        </div>
    );
}

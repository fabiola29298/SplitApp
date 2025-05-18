import React from "react"; 
 
import AddExpenseForm from "./AddExpenseForm";
 
export default function CreateExpensePage() {
    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            {/* Main container */}
            <div className="flex justify-center items-center px-4 py-4">

                {/* Main content */}
                <main className="w-full max-w-[524px] bg-[#00000040]/70 border-none rounded-[26px] overflow-hidden p-10 ">
                    {/* Expense Card */} 
                    <AddExpenseForm/>
                    
                </main>
            </div>
        </div>
    );
}

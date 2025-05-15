import { Badge } from "@/components/ui/badge"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';  
import React from "react";
// Define data for expenses
const expenses = [
    {
        id: 1,
        description: "Dinner and drinks",
        total: "$ 4,50",
        date: "01/05/2025",
        who: "Alan",
        status: "Done",
        icon: "bitcoin",
    },
    {
        id: 2,
        description: "Taxi",
        total: "$12.00",
        date: "03/03/2025",
        who: "Alan, Maria, Dilan",
        status: "Done",
        icon: "ethereum",
    },
];
export default function ExpensesHistorial() {
    return (
        <Card className="w-full max-w-[693px] bg-[#12131A] mb-10 border border-solid  border-gray-600 rounded-[24px] text-white">
        <CardHeader className="flex items-center justify-between border-b border-gray-600 px-8 py-5">
            <CardTitle className="font-paragraph-regular-16-medium text-01-tokens-text-primary">
                Expenses
            </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
            {/* Table Header */}
            <div className="px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="text-xs font-paragraph-extra-small-12-medium text-[color:var(--01-tokens-text-tertiary)]">
                        Description
                    </div>
                    <div className="flex w-[452px] gap-2">
                        <div className="w-[124px] text-xs font-paragraph-extra-small-12-medium text-[color:var(--01-tokens-text-tertiary)]">
                            Total
                        </div>
                        <div className="w-[124px] text-xs font-paragraph-extra-small-12-medium text-[color:var(--01-tokens-text-tertiary)]">
                            Date
                        </div> 
                        <div className="w-[124px] text-xs font-paragraph-extra-small-12-medium text-[color:var(--01-tokens-text-tertiary)]">
                            Status
                        </div>
                        <div className="w-[124px] text-xs font-paragraph-extra-small-12-medium text-[color:var(--01-tokens-text-tertiary)]">
                            Pay
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Table Content */}
            <Table>
                <TableBody>
                    {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                            <TableCell className="pl-8">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-[22px] h-[22px] rounded-[13px] flex items-center justify-center ${
                                            expense.icon === "bitcoin"
                                                ? "bg-[#f5ac37]"
                                                : "bg-[#627eea]"
                                        }`}
                                    > 
                                    </div>
                                    <span className="font-paragraph-extra-small-12-medium text-01-tokens-text-primary">
                                        {expense.description}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex w-[452px] items-center gap-2">
                                    <div className="w-[124px] font-paragraph-extra-small-12-regular text-01-tokens-text-primary">
                                        {expense.total}
                                    </div>
                                    <div className="w-[124px] font-paragraph-extra-small-12-regular text-01-tokens-text-primary">
                                        {expense.date}
                                    </div> 
                                    <Badge
                                        variant="secondary"
                                        className="bg-[color:var(--01-tokens-components-badge-neutral-background)] text-[color:var(--01-tokens-components-badge-neutral-foreground)]"
                                    >
                                        {expense.status}
                                    </Badge>
                                    <div>
                                    <Link href={"/settleUp"}>
                                        <Button
                                                variant="outline"
                                                className="rounded-full text-xs border border-[color:var(--01-tokens-components-button-secondary-border)] bg-01-tokens-components-button-secondary-background"
                                            >
                                                    <HandCoins/>  Pay
                                                </Button>
                                        </Link>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex justify-center py-4">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                className="flex items-center gap-2"
                            >
                                <ChevronLeft className="h-3 w-3" />
                            </PaginationPrevious>
                        </PaginationItem>
                        <PaginationItem>
                            <span className="text-xs text-white">Page 1 of 1</span>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                className="flex items-center gap-2"
                            >
                                <ChevronRight className="h-3 w-3" />
                            </PaginationNext>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </CardContent>
    </Card>

    )
}
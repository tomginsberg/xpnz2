import Image from "next/image";
import {TransactionList} from "@/components/transaction-list";
import GroupExpenseTracker from "../components/group-expense-tracker";


export default function Home() {
    return (
        <>
            <GroupExpenseTracker/>
        </>
    );
}

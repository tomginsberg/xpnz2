import {AnimatePresence} from "framer-motion";
import AnimatedCard from "./animated-card";

export default function ExpensesTab({expenses, onExpenseClick}) {
    return (<div className="columns-2 md:columns-4 lg:columns-5 gap-4 space-y-4 mt-[120px]">
        <AnimatePresence>
            {expenses.map((expense) => (
                <AnimatedCard key={expense.id} expense={expense} onClick={onExpenseClick}/>
            ))}
        </AnimatePresence>
    </div>)
}


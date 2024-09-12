import {useRef} from "react";
import {motion, useInView} from "framer-motion";
import {format} from "date-fns";

export default function AnimatedCard({expense, onClick}) {
    const ref = useRef(null)
    const isInView = useInView(ref, {once: false, amount: 0.2})

    return (
        <motion.div
            ref={ref}
            initial={{opacity: 0, y: 50}}
            animate={isInView ? {opacity: 1, y: 0} : {opacity: 0, y: 30}}
            transition={{duration: 0.5}}
            onClick={() => onClick(expense)}
        >
            <div
                className="rounded-lg bg-gray-100 dark:bg-gray-800 break-inside-avoid mb-4 overflow-hidden
                text-black transition duration-150 ease-in-out active:scale-95 dark:text-gray-100
                hover:transform hover:scale-105
                ">
                <div className="px-4 pt-4">
                    <div className="flex-auto">
                        <div className="flex flex-wrap justify-between">
                            <h2 className="mr-3 truncate text-balance text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {expense.name}
                            </h2>
                            <p className="mt-[0.1rem] truncate font-normal tracking-tight text-gray-700 dark:text-gray-400">
                                ${expense.amount.toFixed(2)}
                            </p>
                        </div>
                    </div>

                </div>

                <div className="px-4 pb-4 pt-0 text-gray-700 dark:text-gray-300">
                    <p className="text-md">{format(expense.date, "PP")}</p>
                    {expense.category && <p className="text-lg">{expense.category}</p>}
                </div>

                {/*<div className="p-4 pt-0 text-gray-700 dark:text-gray-400">*/}
                {/*  <p className="text-md">Paid: {expense.paidBy.join(", ")}*/}
                {/*  </p>*/}
                {/*  <p className="text-md">Split: {expense.splitBetween.join(", ")}</p>*/}
                {/*</div>*/}

            </div>
        </motion.div>
    )
}
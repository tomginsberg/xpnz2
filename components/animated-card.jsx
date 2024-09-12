import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { format } from "date-fns";

export default function AnimatedCard({ expense, onClick }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.2 });

    const [showDetails, setShowDetails] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const handleInteractionStart = () => {
        const id = setTimeout(() => {
            onClick(expense); // Execute the regular click action after 500 ms
            clearTimeout(timeoutId); // Clear the timeout to prevent multiple triggers
            setTimeoutId(null); // Reset the timeout ID
        }, 500);
        setTimeoutId(id); // Store the timeout ID
    };

    const handleInteractionEnd = () => {
        if (timeoutId) {
            clearTimeout(timeoutId); // Clear the timer if the mouse/touch is released before 500 ms
        } else {
            toggleDetails(); // Toggle the details visibility
        }
        setTimeoutId(null);
    };

    const toggleDetails = () => {
        setShowDetails(prev => !prev);
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            onMouseDown={handleInteractionStart}
            onMouseUp={handleInteractionEnd}
            onTouchStart={handleInteractionStart}
            onTouchEnd={handleInteractionEnd}
            onClick={toggleDetails}
            onMouseLeave={() => {
                if (timeoutId) {
                    clearTimeout(timeoutId); // Reset on mouse leave
                    setTimeoutId(null);
                }
            }}
        >
            <div
                className="rounded-lg bg-gray-100 dark:bg-gray-800 break-inside-avoid mb-4 overflow-hidden
                text-black transition duration-150 ease-in-out active:scale-95 dark:text-gray-100
                "
            >
                <div className="px-4 pt-4">
                    <div className="flex-auto">
                        <div className="flex flex-wrap justify-between">
                            <h2 className="mr-3 truncate text-balance text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {expense.name}
                            </h2>
                            <p className="mt-[0.1rem] truncate font-normal tracking-tight text-gray-700 dark:text-gray-400">
                                ${expense.amount.toFixed(2).replace(/\.?0+$/, '')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-4 pt-0 text-gray-700 dark:text-gray-300">
                    <p className="text-md">{format(expense.date, "PP")}</p>
                    {expense.category && <p className="text-lg">{expense.category}</p>}
                </div>



                {/* Toggled visibility section */}
                {showDetails && (
                    <><hr className="mx-3 mb-1 border-gray-300 dark:border-gray-700"/>
                        <div className="p-4 pt-0 text-gray-700 dark:text-gray-400">
                            <p className="text-md">Paid: {expense.paidBy.join(", ")}</p>
                            <p className="text-md">Split: {expense.splitBetween.join(", ")}</p>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}
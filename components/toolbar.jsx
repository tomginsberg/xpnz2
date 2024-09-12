import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { useState, useRef } from "react";

const tabs = [
    { id: "transactions", label: "💸" },
    { id: "members", label: "🧑‍🤝‍🧑" },
    { id: "debts", label: "💳" },
];

export default function ToolBar({ setActiveTab, setIsDrawerOpen, setIsEditMode }) {
    const [activeTab, setActiveTabState] = useState(tabs[0].id);

    const handleTabClick = (tabId) => {
        setActiveTabState(tabId);
        setActiveTab(tabId);
    };

    return (
        <div
            className="fixed bottom-4 left-1/2 z-50 h-16 w-[65%] max-w-sm -translate-x-1/2 rounded-xl bg-gray-200 pr-2 shadow-xl dark:bg-gray-700 flex justify-between items-center px-2">
            <Button
                className="px-3 py-6 rounded-xl bg-blue-600 dark:bg-blue-600 font-medium hover:bg-blue-700 dark:hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                onClick={() => {
                    setIsEditMode(false);
                    setIsDrawerOpen(true);
                }}
            >
                <Plus className="h-7 w-7 text-white"/>
            </Button>

                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={handleTabClick.bind(null, tab.id)}
                        className={`${
                            activeTab === tab.id ? "" : "hover:text-white/60"
                        } relative px-2 py-1.5 transition focus-visible:outline-2`}
                    >
                        {activeTab === tab.id && (
                            <motion.span
                                layoutId="bubble"
                                className="absolute inset-0 z-10 bg-gray-300 dark:bg-gray-600 rounded-xl"
                                transition={{type: "spring", bounce: 0.2, duration: 0.6}}
                            />
                        )}
                        <span className="relative z-20 text-3xl">{tab.label}</span>
                    </button>
                ))}
        </div>
    )
}
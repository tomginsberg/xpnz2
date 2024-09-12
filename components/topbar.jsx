import {useTheme} from "next-themes";
import {Moon, Search, Sun} from "lucide-react";
import {Input} from "./ui/input";
import {Button} from "./ui/button";

export default function TopBar({onSearch, headline}) {
    const {theme, setTheme} = useTheme()

    return (
        <div
            className="fixed top-0 left-0 right-0 z-10 border-b border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex justify-between items-center p-4">
                <h1 className="text-xl font-bold">
                    {headline === "transactions" && <><span role="img" aria-label="Expenses"
                                                            className="me-3 ms-2">💸</span>Expenses</>}
                    {headline === "members" && <><span role="img" aria-label="Expenses"
                                                       className="me-3 ms-2">🧑‍🤝‍🧑</span>Members</>}
                    {headline === "debts" && <><span role="img" aria-label="Expenses"
                                                     className="me-3 ms-2">💳</span>Debts</>}
                </h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    aria-label="Toggle theme"
                >
                    <Sun
                        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
                    <Moon
                        className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
                </Button>
            </div>
            {headline === "transactions" && <div className="px-4 pb-4">
                <div className="relative">
                    <Search className="size-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"/>
                    <Input
                        type="search"
                        placeholder="Search expenses..."
                        className="pb-1.5 w-full pl-10 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
            </div>}
        </div>
    )
}

"use client"

import {useState, useEffect} from 'react';
import {format} from 'date-fns';
import Fuse from 'fuse.js';
import {CalendarIcon} from 'lucide-react';

import {cn} from '../lib/utils';
import DebtsTab from './debts';
import MembersTab from './members';
import ToolBar from './toolbar';
import TopBar from './topbar';
import {Button} from './ui/button';
import {Calendar} from './ui/calendar';
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from './ui/command';
import {Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger} from './ui/drawer';
import {Input} from './ui/input';
import {Label} from './ui/label';
import ExpensesTab from "./expenses";
import {Check} from "lucide-react"
import CalculatorInput from "./calculator-input";
import HoldToDelete from "./delete";
import { toast } from "sonner"


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import {MultiSelect} from "./ui/multi-select";
import {Switch} from "@/components/ui/switch";
import {ScrollArea} from "./ui/scroll-area";


const generateRandomExpense = () => {
    const expenseNames = ["Dinner and a Movie on a Boat", "Movie", "Groceries", "Utilities", "Rent", "Travel", ""]
    const categories = ["🍕 Food", "🎥 Entertainment", "🏠 Housing", "🚂 Transportation", "🚰 Utilities", ""]
    const members = ["Alice", "Bob", "Charlie", "David", "Eve"]

    let name = expenseNames[Math.floor(Math.random() * expenseNames.length)]
    const amount = Math.floor(Math.random() * 10000) / 100
    const date = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
    let category = categories[Math.floor(Math.random() * categories.length)]
    const currency = "CAD"

    if (name === "") {
        name = "Expense"
    }

    // Generate random paidBy
    const paidByMembers = members.filter(() => Math.random() > 0.5);
    const paidBy = paidByMembers.map((member) => ({
        member,
        amount: Math.floor(Math.random() * amount * 100) / 100,
    }));

    // Adjust amounts to sum up to total amount
    const totalContributed = paidBy.reduce((sum, p) => sum + p.amount, 0);
    const adjustmentFactor = amount / totalContributed;
    paidBy.forEach((p) => (p.amount *= adjustmentFactor));
    // round to 2 decimal places
    paidBy.forEach((p) => (p.amount = Math.round(p.amount * 100) / 100));

    // Generate random splitBetween
    const splitBetweenMembers = members.filter(() => Math.random() > 0.5);
    const splitBetween = splitBetweenMembers.map((member) => ({
        member,
        weight: Math.floor(Math.random() * 10) + 1,
        normalizedWeight: 0, // Will be calculated later
    }));

    // Calculate normalized weights
    const totalWeight = splitBetween.reduce((sum, s) => sum + s.weight, 0);
    splitBetween.forEach((s) => (s.normalizedWeight = s.weight / totalWeight));

    return {
        name,
        amount,
        date,
        category,
        paidBy,
        splitBetween,
        currency,
    };
};


export default function Component() {
    const emptyExpense = {
        id: 0,
        name: "",
        amount: null,
        date: new Date(),
        category: null,
        paidBy: [], // [{ member: string, amount: number }]
        splitBetween: [], // [{ member: string, weight: number, normalizedWeight: number }]
    };
    const [expenses, setExpenses] = useState([])
    const [filteredExpenses, setFilteredExpenses] = useState([])
    const [selectedExpense, setSelectedExpense] = useState(emptyExpense)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState("transactions")
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false)
    const [calendarOpen, setIsCalendarOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isUnequalSplit, setIsUnequalSplit] = useState(false);
    const [isIncome, setIncome] = useState(false);

    const categories = [
        "🚰 Utilities",
        "🛒 Groceries",
        "🏠 Rent",
        "🚗 Auto",
        "💳 Subscriptions",
        "🛍️ Shopping",
        "🏥 Health",
        "🍽️ Dining",
        "🚌 Transit",
        "🎉 Entertainment",
        "🏋️ Fitness",
        "📚 Education",
        "🐾 Pets",
        "🎁 Gifts",
        "🧹 Household",
        "💻 Internet",
        "📱 Phone",
        "🛫 Travel",
        "🍷 Alcohol",
        "🧴 Personal Care",
        "💡 Electricity",
        "🌊 Water",
        "🚿 Gas",
        "🌐 Cable",
        "📉 Investments",
        "🛡️ Insurance",
        "📬 Postal",
        "🧾 Taxes",
        "👶 Childcare",
        "🎓 Tuition",
        "🧰 Maintenance",
        "🎨 Crafts",
        "📸 Photography",
        "🎠 Hobbies",
        "🚸 School Supplies",
        "🧢 Sportswear",
        "⚽ Sports",
        "👟 Footwear",
        "🔧 Tools",
        "💊 Supplements",
        "💒 Donations",
        "❓ Misc",
        "🖥️ Tech",
        "📖 Books",
        "🧽 Cleaning",
        "🚪 Home Improvement",
        "🏛️ Museums",
        "🎸 Music Instruments",
        "🎭 Theater",
        "🚬 Tobacco"
    ];
    const members = ['Alice', 'Bob', 'Charlie', 'David', 'Eve']
    const currencies = {
        CAD: '🇨🇦 CAD',
        USD: '🇺🇸 USD',
        EUR: '🇪🇺 EUR',
        JPY: '🇯🇵 JPY',
        GBP: '🇬🇧 GBP',
        PLN: '🇵🇱 PLN',
        CNY: '🇨🇳 CNY',
        INR: '🇮🇳 INR',
        RUB: '🇷🇺 RUB',
        BRL: '🇧🇷 BRL',
        MXN: '🇲🇽 MXN',
        AUD: '🇦🇺 AUD',
        KRW: '🇰🇷 KRW',
        IDR: '🇮🇩 IDR',
        TRY: '🇹🇷 TRY',
        ZAR: '🇿🇦 ZAR',
        NGN: '🇳🇬 NGN',
        SEK: '🇸🇪 SEK',
    }

    useEffect(() => {
        const newExpenses = Array.from({length: 200}, (_, i) => ({
            id: i,
            ...generateRandomExpense(),
        }))
        console.log(newExpenses)
        setExpenses(newExpenses)
        setFilteredExpenses(newExpenses)
    }, [])

    useEffect(() => {
        if (searchTerm) {
            const fuse = new Fuse(expenses, {
                keys: ['name', 'category'],
                threshold: 0.3,
            })
            const results = fuse.search(searchTerm)
            setFilteredExpenses(results.map(result => result.item))
        } else {
            setFilteredExpenses(expenses)
        }
    }, [searchTerm, expenses])

    const handleExpenseClick = (expense) => {
        setSelectedExpense(expense)
        setIsDrawerOpen(true)
        setIsEditMode(true)
    }

    const handleCategoryChange = (value) => {
        setSelectedExpense(prev => ({...prev, category: value}))
        setIsCategoryDrawerOpen(false)
    }

    const handleInputChange = (e) => {
        const {id, value} = e.target
        setSelectedExpense(prev => ({...prev, [id]: value}))
    }

    const handleCloseDrawer = () => {
        setSelectedExpense(emptyExpense)
        setIsDrawerOpen(false)
    }

    const handleSearch = (term) => {
        setSearchTerm(term)
    }

    const handleSubmit = (e) => {
        toast("Expense saved")
        e.preventDefault();

        // Compute total weight
        const totalWeight = selectedExpense.splitBetween.reduce((sum, s) => sum + s.weight, 0);

        // Calculate normalized weights
        const splitBetween = selectedExpense.splitBetween.map((s) => ({
            ...s,
            normalizedWeight: s.weight / totalWeight,
        }));

        // Validate total contributions
        const totalContributed = selectedExpense.paidBy.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalExpenseAmount = parseFloat(selectedExpense.amount);

        if (totalContributed !== totalExpenseAmount) {
            alert("Total contributions do not match the expense amount.");
            return;
        }

        // Prepare expense object to save
        const expenseToSave = {
            ...selectedExpense,
            splitBetween,
            amount: totalExpenseAmount,
        };

        if (isEditMode) {
            setExpenses((prev) =>
                prev.map((t) => (t.id === expenseToSave.id ? expenseToSave : t))
            );
        } else {
            const newExpense = {
                id: expenses.length + 1,
                ...expenseToSave,
            };
            setExpenses((prev) => [...prev, newExpense]);
        }
        handleCloseDrawer();
    };
    const handleDelete = () => {
        setExpenses(prev => prev.filter(t => t.id !== selectedExpense.id))
        handleCloseDrawer()
    }

    function getDrawerTitle(edit, income) {
        let type = income ? "Income" : "Expense"
        return edit ? "Edit " + type : "Add New " + type
    }


    // noinspection RequiredAttributes
    return (
        <div className="min-h-screen">
            <TopBar onSearch={handleSearch} headline={activeTab}/>
            <div className="h-full w-full rounded-md p-4">
                {activeTab === "transactions" &&
                    <ExpensesTab expenses={filteredExpenses} onExpenseClick={handleExpenseClick}/>}
                {activeTab === "members" && <MembersTab/>}
                {activeTab === "debts" && <DebtsTab/>}
            </div>


            <Drawer open={isDrawerOpen} onClose={handleCloseDrawer}>
                <DrawerContent className="h-[90%]">

                    <DrawerHeader className="ml-4 -mb-2">
                        <DrawerTitle>{getDrawerTitle(isEditMode, isIncome)}</DrawerTitle>
                    </DrawerHeader>
                    <ScrollArea>
                        <form onSubmit={handleSubmit} className="px-4 space-y-4">
                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="name">Name</Label>
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="unequal-split">Income</Label>
                                            <Switch
                                                id="income"
                                                checked={isIncome}
                                                onCheckedChange={setIncome}
                                            />
                                        </div>
                                    </div>
                                    <Input
                                        id="name"
                                        value={selectedExpense.name}
                                        onChange={handleInputChange}
                                        placeholder={"Expense"}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                setTimeout(() => e.target.blur(), 0);
                                            }
                                        }}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex-1 space-y-2">
                                            <CalculatorInput
                                                value={selectedExpense.amount}
                                                onChange={(value) => setSelectedExpense((prev) => ({
                                                    ...prev,
                                                    amount: value
                                                }))}
                                                disabled={selectedExpense.paidBy.length > 1}
                                                useLabel={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="w-24 space-y-2">
                                        <Label htmlFor="currency">Currency</Label>
                                        <Select>
                                            <SelectTrigger id="currency">
                                                <SelectValue placeholder={currencies['CAD']}/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(currencies).map(([code, flag]) => (
                                                    <SelectItem key={code} value={code}>{flag}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                </div>

                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Dialog open={calendarOpen} onOpenChange={setIsCalendarOpen} className="rounded-xl">
                                        <DialogTrigger asChild>
                                            <Button variant="outline"
                                                    className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-1 h-4 w-4 translate-x-[-5px]"/>
                                                {selectedExpense.date ? format(selectedExpense.date, 'PPP') :
                                                    <span>Pick a date</span>}
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent className="w-auto p-0 rounded-lg" hasClose={false}>
                                            <Calendar mode="single" selected={selectedExpense.date}
                                                      onSelect={(date) => {
                                                          setSelectedExpense(prev => ({...prev, date}));
                                                          setIsCalendarOpen(false);
                                                      }} initialFocus/>
                                        </DialogContent>
                                    </Dialog>
                                </div>


                                <Drawer open={isCategoryDrawerOpen} onClose={() => setIsCategoryDrawerOpen(false)}>
                                    <DrawerTrigger asChild>
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() => {
                                                    setIsDrawerOpen(true);
                                                    setIsCategoryDrawerOpen(true);
                                                }
                                                }
                                            >
                                                {selectedExpense.category || 'Select a category'}
                                            </Button>
                                        </div>
                                    </DrawerTrigger>
                                    <DrawerContent side="bottom">
                                        <DrawerHeader>
                                            <DrawerTitle>Select Category</DrawerTitle>
                                        </DrawerHeader>
                                        <div className="p-4">

                                            <Command>
                                                <CommandInput placeholder="Search category..."/>
                                                <CommandList>
                                                    <CommandEmpty>No category found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {categories.map((category) => (
                                                            <CommandItem
                                                                key={category}
                                                                value={category}
                                                                onSelect={handleCategoryChange}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedExpense.category === category ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {category}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </div>
                                    </DrawerContent>
                                </Drawer>


                                <div className="space-y-2">
                                    <Label>Paid By</Label>
                                    <MultiSelect
                                        options={members.map((member) => ({label: member, value: member}))}
                                        defaultValue={selectedExpense.paidBy.map((p) => p.member)}
                                        onValueChange={(values) => {
                                            const paidBy = values.map((member) => {
                                                const existing = selectedExpense.paidBy.find((p) => p.member === member);
                                                return existing || {member, amount: 0};
                                            });

                                            // Recalculate the total amount from the new paidBy array
                                            const totalAmount = paidBy.reduce((sum, p) => sum + (p.amount || 0), 0);

                                            setSelectedExpense((prev) => ({
                                                ...prev,
                                                paidBy,
                                                amount: totalAmount,
                                            }));
                                        }}
                                    />

                                    {selectedExpense.paidBy.length > 1 &&
                                        <div className="pb-4">
                                            {selectedExpense.paidBy.map((payer, index) => (
                                                <div key={payer.member}
                                                     className="flex items-center space-x-2 space-y-2">
                                                    <span className="w-20">{payer.member}</span>
                                                    <div className="flex-grow">
                                                        <CalculatorInput
                                                            value={payer.amount}
                                                            onChange={(value) => {
                                                                setSelectedExpense((prev) => {
                                                                    const paidBy = [...prev.paidBy];
                                                                    paidBy[index] = {...paidBy[index], amount: value};
                                                                    // Update the total amount
                                                                    const totalAmount = paidBy.reduce((sum, p) => sum + p.amount, 0);
                                                                    return {...prev, paidBy, amount: totalAmount};
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))} </div>}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Split Between</Label>
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="unequal-split">Unequal Split</Label>
                                            <Switch
                                                id="unequal-split"
                                                checked={isUnequalSplit}
                                                onCheckedChange={setIsUnequalSplit}
                                            />
                                        </div>
                                    </div>

                                    <MultiSelect
                                        options={members.map((member) => ({label: member, value: member}))}
                                        defaultValue={selectedExpense.splitBetween.map((s) => s.member)}
                                        onValueChange={(values) => {
                                            // Update splitBetween with selected members and default weights
                                            const splitBetween = values.map((member) => {
                                                const existing = selectedExpense.splitBetween.find((s) => s.member === member);
                                                return existing || {member, weight: 1, normalizedWeight: 0};
                                            });
                                            setSelectedExpense((prev) => ({...prev, splitBetween}));
                                        }}
                                    />

                                    {isUnequalSplit &&
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">{
                                            selectedExpense.splitBetween.map((splitter, index) => (
                                                <div key={splitter.member} className="flex items-center space-x-2">
                                                    {/*<span className="w-20 text-sm font-semibold">{splitter.member}</span>*/}
                                                    <div className="flex-grow"><CalculatorInput
                                                        value={splitter.weight}
                                                        onChange={(value) => {
                                                            setSelectedExpense((prev) => {
                                                                const splitBetween = [...prev.splitBetween];
                                                                splitBetween[index] = {
                                                                    ...splitBetween[index],
                                                                    weight: value
                                                                };
                                                                return {...prev, splitBetween};
                                                            });
                                                        }}
                                                        disabled={!isUnequalSplit}
                                                        useLabel={true}
                                                        label={splitter.member}
                                                    /></div>
                                                </div>
                                            ))}
                                        </div>
                                    }
                                </div>
                            </div>

                            <DrawerFooter>
                                <div className="flex justify-between w-full">
                                    <Button type="button" variant="outline" onClick={handleCloseDrawer}>
                                        ⬅️
                                    </Button>
                                    <div className="space-x-2">
                                        {isEditMode && (
                                            <HoldToDelete onConfirm={handleDelete}/>
                                        )}
                                        <Button type="submit" variant="outline">
                                            💾
                                        </Button>
                                    </div>
                                </div>
                            </DrawerFooter>
                        </form>
                    </ScrollArea>
                </DrawerContent>
            </Drawer>


            <ToolBar activeTab={activeTab} setActiveTab={setActiveTab} setIsDrawerOpen={setIsDrawerOpen}
                     setIsEditMode={setIsEditMode}/>
        </div>
    )
}
"use client"

import {useState, useEffect} from 'react';
import {format} from 'date-fns';
import Fuse from 'fuse.js';
import {CalendarIcon, Banknote, Search} from 'lucide-react';

import {cn} from '../lib/utils';
import DebtsTab from './debts';
import MembersTab from './members';
import ToolBar from './toolbar';
import TopBar from './topbar';
import {Button} from './ui/button';
import {Calendar} from './ui/calendar';
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from './ui/command';
import {Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle} from './ui/drawer';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {Popover, PopoverContent, PopoverTrigger} from './ui/popover';
import {ScrollArea} from './ui/scroll-area';
import ExpensesTab from "./expenses";
import {Check, ChevronsUpDown} from "lucide-react"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const generateRandomExpense = () => {
    const expenseNames = ["Dinner and a Movie on a Boat", "Movie", "Groceries", "Utilities", "Rent", "Travel", ""]
    const categories = ["🍕 Food", "🎥 Entertainment", "🏠 Housing", "🚂 Transportation", "🚰 Utilities", ""]
    const members = ["Alice", "Bob", "Charlie", "David", "Eve"]

    let name = expenseNames[Math.floor(Math.random() * expenseNames.length)]
    const amount = Math.floor(Math.random() * 10000) / 100
    const date = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
    let category = categories[Math.floor(Math.random() * categories.length)]
    const paidBy = [members[Math.floor(Math.random() * members.length)]]
    const splitBetween = members.filter(() => Math.random() > 0.5)
    const currency = "CAD"

    if (name === "") {
        name = "Expense"
    }

    return {name, amount, date, category, paidBy, splitBetween, currency}
}


export default function Component() {
    const emptyExpense = {
        id: 0,
        name: "",
        amount: null,
        date: new Date(),
        category: null,
        paidBy: [],
        splitBetween: [],
    }
    const [expenses, setExpenses] = useState([])
    const [filteredExpenses, setFilteredExpenses] = useState([])
    const [selectedExpense, setSelectedExpense] = useState(emptyExpense)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState("transactions")
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false)
    const [calendarOpen, setIsCalendarOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false)
    const [isCurrencyPopoverOpen, setIsCurrencyPopoverOpen] = useState(false)

    const categories = ["🍕 Food", "🎥 Entertainment", "🏠 Housing", "🚂 Transportation", "🚰 Utilities"]
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
        const newExpenses = Array.from({length: 20}, (_, i) => ({
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
        e.preventDefault()
        if (isEditMode) {
            setExpenses(prev => prev.map(t =>
                t.id === selectedExpense.id ? {
                    ...selectedExpense,
                    amount: parseFloat(selectedExpense.amount)
                } : t
            ))
        } else {
            const newTransaction = {
                id: expenses.length + 1,
                ...selectedExpense,
                amount: parseFloat(selectedExpense.amount)
            }
            setExpenses(prev => [...prev, newTransaction])
        }
        handleCloseDrawer()
    }
    const handleDelete = () => {
        setExpenses(prev => prev.filter(t => t.id !== selectedExpense.id))
        handleCloseDrawer()
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
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{isEditMode ? "Edit Transaction" : "Add New Transaction"}</DrawerTitle>
                    </DrawerHeader>
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Expense Name</Label>
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
                                <Label htmlFor="amount">Amount</Label>
                                <div className="relative">
                                    <Banknote
                                        className="size-5 absolute left-3 top-1/2 mt-[1px] transform -translate-y-1/2"/>
                                    <Input
                                        id="amount" type="number"
                                        placeholder="0.00"
                                        onChange={handleInputChange}
                                        value={selectedExpense.amount}
                                        className="pl-10"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                e.target.blur();
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="w-24 space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select>
                                <SelectTrigger id="currency">
                                    <SelectValue placeholder={currencies['CAD']} />
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
                            <div className="space-y-2">
                                <Label htmlFor="paidBy">Paid By</Label>
                                <Select value={selectedExpense.paidBy} onValueChange={
                                    (value) => setSelectedExpense(prev => ({...prev, paidBy: value}))
                                }>
                                    <SelectTrigger id="paidBy">
                                        <SelectValue placeholder="Select a member"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {members.map((member) => (
                                            <SelectItem key={member} value={member}>{member}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/*<div className="space-y-2">*/}
                            {/*    <Label htmlFor="splitBetween">Split Between</Label>*/}
                            {/*    <Select value={splitBetween} onValueChange={setSplitBetween}>*/}
                            {/*        <SelectTrigger id="splitBetween">*/}
                            {/*            <SelectValue placeholder="Select a member"/>*/}
                            {/*        </SelectTrigger>*/}
                            {/*        <SelectContent>*/}
                            {/*            {members.map((member) => (*/}
                            {/*                <SelectItem key={member} value={member}>{member}</SelectItem>*/}
                            {/*            ))}*/}
                            {/*        </SelectContent>*/}
                            {/*    </Select>*/}
                            {/*</div>*/}
                        </div>

                        <DrawerFooter>
                            <div className="flex justify-between w-full">
                                <Button type="button" variant="outline" onClick={handleCloseDrawer}>
                                    Cancel
                                </Button>
                                <div className="space-x-2">
                                    {isEditMode && (
                                        <Button type="button" variant="destructive" onClick={handleDelete}>
                                            Delete
                                        </Button>
                                    )}
                                    <Button type="submit">
                                        {isEditMode ? "Save" : "Add"} Transaction
                                    </Button>
                                </div>
                            </div>
                        </DrawerFooter>
                    </form>
                </DrawerContent>
            </Drawer>

            <Drawer open={isCategoryDrawerOpen} onClose={() => setIsCategoryDrawerOpen(false)}>
                <DrawerContent>
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

            <ToolBar activeTab={activeTab} setActiveTab={setActiveTab} setIsDrawerOpen={setIsDrawerOpen}
                     setIsEditMode={setIsEditMode}/>
        </div>
    )
}
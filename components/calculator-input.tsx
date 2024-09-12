import React, {useState} from 'react'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Calculator} from "./calculator"
import {Banknote, Lock, Calculator as CalculatorIcon} from "lucide-react"
import {Drawer, DrawerContent, DrawerTrigger} from '@/components/ui/drawer';

interface CalculatorInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export default function CalculatorInput({value, onChange, disabled}: CalculatorInputProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleCalculatorEnter = (value: string) => {
        onChange(value)
        setIsDialogOpen(false)
    }

    return (
        <div className="space-y-2">
            <Label htmlFor="number-input">Amount</Label>

            <div className="relative">
                <Banknote
                    className="size-5 absolute left-3 top-1/2 mt-[0.4px] transform -translate-y-1/2"/>

                <div className="flex space-x-2">
                    <Input
                        id="number-input"
                        type="text"
                        placeholder={'0.00'}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="pl-10"
                        disabled={disabled}
                    />
                    <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DrawerTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={disabled}
                            >
                                {disabled ? <Lock className="h-4 w-4"/> : <CalculatorIcon className="h-4 w-4"/>}
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <Calculator
                                initialValue={value}
                                onEnter={handleCalculatorEnter}
                            />
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>


        </div>
    )
}
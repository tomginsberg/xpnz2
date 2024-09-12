import {useState, useEffect, KeyboardEvent} from 'react'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {AlertCircle, ArrowRight, Delete} from "lucide-react"
import {Alert, AlertDescription} from "@/components/ui/alert"

interface CalculatorProps {
    initialValue: string;
    onEnter: (value: string) => void;
}

export function Calculator({initialValue, onEnter}: CalculatorProps) {
    const [input, setInput] = useState(initialValue.toString())
    const [error, setError] = useState<string | null>(null)
    const [isEvaluated, setIsEvaluated] = useState(false)

    useEffect(() => {
        setInput(initialValue)
        setIsEvaluated(false)
    }, [initialValue])

    const evaluateExpression = (expression: string) => {
        try {
            // Replace 'x' with '*' for multiplication
            const result = eval(expression.toString().replace(/×/g, '*'))
            if (isNaN(result) || !isFinite(result)) {
                throw new Error("Invalid result")
            }
            // round to max 3 decimal places
            // remove trailing zeroes
            if (result % 1 !== 0) {
                return result.toFixed(3).replace(/\.?0+$/, '')
            }
            return result.toString()
        } catch (error) {
            throw new Error("Invalid expression")
        }
    }

    const handleEvaluate = () => {
        try {
            const result = evaluateExpression(input)
            setInput(result)
            setIsEvaluated(true)
            setError(null)
        } catch (error) {
            setError("Invalid expression. Please check and try again.")
        }
    }

    const handleSubmit = () => {
        try {
            const result = isEvaluated ? input : evaluateExpression(input)
            onEnter(result)
        } catch (error) {
            setError("Invalid expression. Please check and try again.")
        }
    }

    const handleButtonClick = (value: string) => {
        setError(null)
        if (value === 'Enter') {
            handleSubmit()
        } else if (value === 'Backspace') {
            // make sure to convert to string then remove last character
            setInput(prev => prev.toString().slice(0, -1))
            setIsEvaluated(false)
        } else if (value === '=') {
            if (isEvaluated) {
                handleSubmit()
            } else {
                handleEvaluate()
            }
        } else {
            setInput(prev => prev + value)
            setIsEvaluated(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
        setError(null)
        setIsEvaluated(false)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleButtonClick('=')
        }
    }

    const buttons = [
        '7', '8', '9', '/',
        '4', '5', '6', '×',
        '1', '2', '3', '-',
        '0', '.', '=', '+',
        '(', ')', 'Enter', 'Backspace'
    ]

    const buttonVariants: { [key: string]: string } = {
        '/': 'secondary',
        '×': 'secondary',
        '-': 'secondary',
        '+': 'secondary',
        '=': 'secondary',
        'Enter': 'outline',
        'Backspace': 'destructive',
    }

    // @ts-expect-error - TS doesn't know if the value is a key of buttonVariants
    return (
        <div className="w-full max-w-md mx-auto p-4 rounded-lg">
            <Input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full mb-4 text-left text-lg font-mono"
                aria-label="Calculator input"
                inputMode='none'
                id='calculator-input'
            />
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4"/>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="grid grid-cols-4 gap-2">
                {buttons.map((btn) => (
                    <Button
                        key={btn}
                        onClick={() => handleButtonClick(btn)}
                        className="h-12"
                        variant={buttonVariants[btn] || 'default'}
                        aria-label={btn}
                    >
                        {btn === 'Backspace' ? <Delete className="h-4 w-4"/> :
                            btn === 'Enter' ? <ArrowRight className="h-4 w-4"/> :
                                btn}
                    </Button>
                ))}
            </div>
        </div>
    )
}
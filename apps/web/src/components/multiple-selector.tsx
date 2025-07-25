import React, { useState, useCallback, useMemo, forwardRef } from "react"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { ChevronDownIcon } from "lucide-react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
// --- Multi-Select Component (based on shadcn-ui-expansions) ---

export type Option = {
    value: string
    label: string
    disable?: boolean
}

interface MultipleSelectorProps {
    value: Option[]
    onChange: React.Dispatch<React.SetStateAction<Option[]>>
    defaultOptions?: Option[]
    placeholder?: string
    /**
     * The duration of the animation.
     * @default 100
     */
    animation?: number
    /**
     * When "empty", it will be un-selectable but visible.
     * @default "empty"
     */
    emptyIndicator?: React.ReactNode
}

export const MultipleSelector = forwardRef<HTMLButtonElement, MultipleSelectorProps>(
    (
        {
            value,
            onChange,
            placeholder,
            defaultOptions = [],
            emptyIndicator,
            animation = 100,
        }: MultipleSelectorProps,
        ref
    ) => {
        const [open, setOpen] = useState(false)
        const [inputValue, setInputValue] = useState("")

        const onSelectOption = useCallback(
            (option: Option) => {
                const isSelected = value.some((v) => v.value === option.value)
                if (isSelected) {
                    onChange(value.filter((v) => v.value !== option.value))
                } else {
                    onChange([...value, option])
                }
            },
            [value, onChange]
        )

        const onRemoveOption = (option: Option) => {
            onChange(value.filter((v) => v.value !== option.value))
        }

        const filteredOptions = useMemo(() => {
            if (!inputValue) return defaultOptions
            return defaultOptions.filter((option) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
            )
        }, [inputValue, defaultOptions])

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        ref={ref}
                        className="flex w-full items-center justify-between rounded-md border border-input bg-background p-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => setOpen(!open)}
                    >
                        <div className="flex flex-wrap items-center gap-1">
                            {value.length > 0 ? (
                                value.map((option) => (
                                    <Badge
                                        key={option.value}
                                        variant="secondary"
                                        className="gap-1.5"
                                    >
                                        {option.label}
                                        <button
                                            aria-label={`Remove ${option.label} option`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onRemoveOption(option)
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.stopPropagation()
                                                    onRemoveOption(option)
                                                }
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-muted-foreground px-2">{placeholder}</span>
                            )}
                        </div>
                        <ChevronDownIcon
                            className={`h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[var(--radix-popper-anchor-width)] p-0"
                    align="start"
                >
                    <Command>
                        <CommandInput
                            placeholder="Search..."
                            value={inputValue}
                            onValueChange={setInputValue}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {emptyIndicator || "No results found."}
                            </CommandEmpty>
                            <CommandGroup>
                                {filteredOptions.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => onSelectOption(option)}
                                        disabled={option.disable}
                                        className="cursor-pointer"
                                    >
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        )
    }
)

MultipleSelector.displayName = "MultipleSelector"
export default MultipleSelector;
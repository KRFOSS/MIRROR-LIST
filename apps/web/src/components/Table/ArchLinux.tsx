"use client"

import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useId,
    useMemo,
    useState,
    useRef
} from "react"
import {
    Column,
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    RowData,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"
import { Command as CommandPrimitive } from "cmdk"
import {
    ChevronDownIcon,
    ChevronUpIcon,
    ExternalLinkIcon,
    SearchIcon,
    X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// --- Helper Components & Types (Mocks for self-containment) ---
// These are simplified versions or implementations of components you might have.

// Assuming cn utility exists in your project
// const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

// Assuming Badge component exists in your project
// const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
//     <div ref={ref} className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', className)} {...props} />
// ));

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

const MultipleSelector = forwardRef<HTMLButtonElement, MultipleSelectorProps>(
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

// --- Type Definitions ---

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: "text" | "range" | "select"
    }
}

type MirrorInfo = {
    host: string
    country: string
    protocols: string[]
    last_sync: string | null
    score: number
    url: string
}

type RawProtocol = {
    url: string
    last_sync: string | null
    score: number
    active: boolean
}

type RawMirror = {
    host: string
    protocols: Record<string, RawProtocol>
}

type ApiResponse = Record<string, RawMirror[]>

// --- Column Definitions ---

const columns: ColumnDef<MirrorInfo>[] = [
    {
        header: "호스트",
        accessorKey: "host",
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("host")}</div>
        ),
        meta: {
            filterVariant: "text",
        },
    },
    {
        header: "국가",
        accessorKey: "country",
        meta: {
            filterVariant: "text",
        },
    },
    {
        header: "프로토콜",
        accessorKey: "protocols",
        cell: ({ row }) => {
            const protocols = row.getValue("protocols") as string[]
            return <div className="flex gap-2">{protocols.join(" | ")}</div>
        },
        meta: {
            filterVariant: "select",
        },
        filterFn: (row, id, filterValue) => {
            const rowValue = row.getValue(id) as string[]
            return rowValue.includes(filterValue as string)
        },
        enableSorting: false,
    },
    {
        header: "최근 동기화 (KST)",
        accessorKey: "last_sync",
        cell: ({ row }) => {
            const lastSync = row.getValue("last_sync") as string | null
            if (!lastSync) return <span className="text-muted-foreground">N/A</span>
            return new Date(lastSync).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) // Convert to KST
        },
    },
    {
        header: "점수",
        accessorKey: "score",
        cell: ({ row }) => {
            const score = parseFloat(row.getValue("score"))
            return score.toFixed(4)
        },
        meta: {
            filterVariant: "range",
        }
    },
    {
        header: "상세",
        accessorKey: "url",
        cell: ({ row }) => (
            <a className="inline-flex items-center gap-1 text-blue-600 hover:underline" href={row.getValue("url")} target="_blank" rel="noopener noreferrer">
                Visit <ExternalLinkIcon size={12} aria-hidden="true" />
            </a>
        ),
        enableSorting: false,
    },
]

// --- Main Component ---

export default function ArchMirrorTable() {
    const [rawData, setRawData] = useState<ApiResponse | null>(null)
    const [countries, setCountries] = useState<string[]>([])
    const [selectedCountries, setSelectedCountries] = useState<Option[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([
        { id: "score", desc: true },
    ])

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetch("https://imnyang.krfoss.org/api/mirrorlist/archlinux")
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const data: ApiResponse = await response.json()
                setRawData(data)
                const countryNames = Object.keys(data).sort()
                setCountries(countryNames)
            } catch (e: any) {
                setError(e.message || "Failed to fetch data.")
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const countryOptions: Option[] = useMemo(() => countries.map(c => ({ value: c, label: c })), [countries]);

    const processedData = useMemo<MirrorInfo[]>(() => {
        if (!rawData) return []

        const processMirrors = (mirrors: RawMirror[], country: string): MirrorInfo[] => {
            return mirrors
                .map((mirror) => {
                    const activeProtocols = Object.entries(mirror.protocols)
                        .filter(([_, protocolDetails]) => protocolDetails.active)
                        .map(([protocolName, protocolDetails]) => ({
                            name: protocolName,
                            ...protocolDetails,
                        }))

                    if (activeProtocols.length === 0) return null

                    const primaryProtocol = activeProtocols[0]

                    return {
                        host: mirror.host,
                        country: country,
                        protocols: activeProtocols.map(p => p.name),
                        last_sync: primaryProtocol.last_sync,
                        score: primaryProtocol.score,
                        url: primaryProtocol.url,
                    }
                })
                .filter((item): item is MirrorInfo => item !== null)
        }

        const selectedValues = selectedCountries.map(c => c.value);

        if (selectedValues.length === 0) {
            return Object.entries(rawData).flatMap(([country, mirrors]) =>
                processMirrors(mirrors, country)
            )
        }

        return selectedValues.flatMap(countryName => {
            const countryMirrors = rawData[countryName] || []
            return processMirrors(countryMirrors, countryName)
        })

    }, [rawData, selectedCountries])

    const table = useReactTable({
        data: processedData,
        columns,
        state: {
            sorting,
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        onSortingChange: setSorting,
        enableSortingRemoval: false,
    })

    if (isLoading) {
        return <div className="text-center p-8">Loading mirror data...</div>
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-2">Arch Linux 미러 목록</h1>

                {/* Controls */}
                <div className="flex flex-wrap gap-4 mb-6 items-end">
                    {/* Country Selector */}
                    <div className="w-full sm:w-64">
                        <Label>국가</Label>
                        <div className="mt-2">
                            <MultipleSelector
                                value={selectedCountries}
                                onChange={setSelectedCountries}
                                defaultOptions={countryOptions}
                                placeholder="Select countries..."
                                emptyIndicator={
                                    <p className="text-center text-sm text-muted-foreground">
                                        No results found.
                                    </p>
                                }
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="w-full sm:w-44">
                        <Filter column={table.getColumn("host")!} />
                    </div>
                    <div className="w-full sm:w-36">
                        <Filter column={table.getColumn("protocols")!} />
                    </div>
                    <div className="w-full sm:w-40">
                        <Filter column={table.getColumn("score")!} />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="relative h-10 select-none"
                                            aria-sort={
                                                header.column.getIsSorted() === "asc"
                                                    ? "ascending"
                                                    : header.column.getIsSorted() === "desc"
                                                        ? "descending"
                                                        : "none"
                                            }
                                        >
                                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                <div
                                                    className="flex h-full cursor-pointer items-center gap-2 select-none"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: <ChevronUpIcon className="shrink-0 opacity-60" size={16} />,
                                                        desc: <ChevronDownIcon className="shrink-0 opacity-60" size={16} />,
                                                    }[header.column.getIsSorted() as string] ?? (
                                                            <span className="w-4" />
                                                        )}
                                                </div>
                                            ) : (
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results found for the selected criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

// --- Filter Component ---
function Filter({ column }: { column: Column<any, unknown> }) {
    const id = useId()
    const columnFilterValue = column.getFilterValue()
    const { filterVariant } = column.columnDef.meta ?? {}
    const columnHeader =
        typeof column.columnDef.header === "string" ? column.columnDef.header : ""

    const sortedUniqueValues = useMemo(() => {
        if (filterVariant === "range") return []
        const values = Array.from(column.getFacetedUniqueValues().keys())
        const flattenedValues = values.flat();
        return Array.from(new Set(flattenedValues)).sort()
    }, [column.getFacetedUniqueValues, filterVariant])

    if (filterVariant === "range") {
        const [min, max] = column.getFacetedMinMaxValues() ?? [0, 0];
        return (
            <div>
                <Label>{columnHeader}</Label>
                <div className="flex items-center gap-2 mt-2">
                    <Input
                        id={`${id}-range-1`}
                        type="number"
                        min={min}
                        max={max}
                        value={(columnFilterValue as [number, number])?.[0] ?? ""}
                        onChange={(e) =>
                            column.setFilterValue((old: [number, number]) => [
                                e.target.value ? Number(e.target.value) : undefined,
                                old?.[1],
                            ])
                        }
                        placeholder={`Min ${min !== undefined ? `(${min.toFixed(2)})` : ''}`}
                        className="w-24"
                        aria-label={`${columnHeader} min`}
                    />
                    <span>-</span>
                    <Input
                        id={`${id}-range-2`}
                        type="number"
                        min={min}
                        max={max}
                        value={(columnFilterValue as [number, number])?.[1] ?? ""}
                        onChange={(e) =>
                            column.setFilterValue((old: [number, number]) => [
                                old?.[0],
                                e.target.value ? Number(e.target.value) : undefined,
                            ])
                        }
                        placeholder={`Max ${max !== undefined ? `(${max.toFixed(2)})` : ''}`}
                        className="w-24"
                        aria-label={`${columnHeader} max`}
                    />
                </div>
            </div>
        )
    }

    if (filterVariant === "select") {
        return (
            <div>
                <Label htmlFor={`${id}-select`}>{columnHeader}</Label>
                <Select
                    value={(columnFilterValue as string) ?? "all"}
                    onValueChange={(value) =>
                        column.setFilterValue(value === "all" ? undefined : value)
                    }
                >
                    <SelectTrigger id={`${id}-select`} className="mt-2">
                        <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {sortedUniqueValues.map((value) => (
                            <SelectItem key={String(value)} value={String(value)}>
                                {String(value)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )
    }

    return (
        <div>
            <Label htmlFor={`${id}-input`}>{columnHeader}</Label>
            <div className="relative mt-2">
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                    <SearchIcon size={16} />
                </div>
                <Input
                    id={`${id}-input`}
                    type="text"
                    value={(columnFilterValue ?? "") as string}
                    onChange={(e) => column.setFilterValue(e.target.value)}
                    placeholder={`Search...`}
                    className="peer ps-9"
                />
            </div>
        </div>
    )
}

// Filter.tsx
// 수정할 내용 없음. 기존 코드와 동일합니다.

import React, { useId, useMemo } from "react";
import { Column } from "@tanstack/react-table";
import {
    Input
} from "@/components/ui/input";
import {
    Label,
} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";
import { ProtocolDetail } from "./type";

// --- Filter Component ---
export default function Filter({ column }: { column: Column<any, unknown> }) {
    const id = useId()
    const columnFilterValue = column.getFilterValue()
    const { filterVariant } = column.columnDef.meta ?? {}
    const columnHeader =
        typeof column.columnDef.header === "string" ? column.columnDef.header : ""

    const sortedUniqueValues = useMemo(() => {
        if (filterVariant === "range") return []
        if (column.id === "protocols") {
            // Manually collect all unique protocol names from the processed data
            const allProtocolNames = new Set<string>();
            column.getFacetedRowModel().flatRows.forEach(row => {
                const protocols = row.original.protocols as ProtocolDetail[];
                protocols.forEach(p => allProtocolNames.add(p.name));
            });
            return Array.from(allProtocolNames).sort();
        }
        const values = Array.from(column.getFacetedUniqueValues().keys())
        return Array.from(new Set(values)).sort()
    }, [column.getFacetedUniqueValues, filterVariant, column.id, column.getFacetedRowModel])

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
                        placeholder={`최소`}
                        className="w-24"
                        aria-label={`${columnHeader} 최소값`}
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
                        placeholder={`최대`}
                        className="w-24"
                        aria-label={`${columnHeader} 최대값`}
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
                        <SelectValue placeholder="모두" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">모두</SelectItem>
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
                    placeholder={`검색...`}
                    className="peer ps-9"
                />
            </div>
        </div>
    )
}
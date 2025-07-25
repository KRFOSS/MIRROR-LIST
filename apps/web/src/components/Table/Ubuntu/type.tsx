// --- Type Definitions ---

import { RowData, ColumnDef } from "@tanstack/react-table";
import { ExternalLinkIcon } from "lucide-react";

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: "text" | "range" | "select"
    }
}

type ProtocolDetail = {
    name: string;
    url: string;
    last_sync: string | null;
    score: number;
};

type MirrorInfo = {
    host: string;
    country: string;
    protocols: ProtocolDetail[]; // All active protocols for dialog
    last_sync: string | null; // Latest sync from http/https/rsync
    score: number; // Combined score from http/https/rsync
    url: string; // Primary URL (https > http > rsync)
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
            const protocols = row.getValue("protocols") as ProtocolDetail[]
            return <div className="flex gap-2">{protocols.map(p => p.name).join(" | ")}</div>
        },
        meta: {
            filterVariant: "select",
        },
        filterFn: (row, id, filterValue) => {
            const rowProtocols = row.getValue(id) as ProtocolDetail[];
            return rowProtocols.some(p => p.name === (filterValue as string));
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
            <a href="#">
                <ExternalLinkIcon size={12} aria-hidden="true" />
            </a>
        ),
        enableSorting: false,
    },
]

export { columns };
export type { MirrorInfo, ProtocolDetail, RawMirror, RawProtocol, ApiResponse };
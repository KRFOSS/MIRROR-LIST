// type.tsx
// --- Type Definitions ---

import { RowData, ColumnDef } from "@tanstack/react-table"
import { ExternalLinkIcon } from "lucide-react"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select"
  }
}

// 단순화된 프로토콜 상세 정보 (score, last_sync 없음)
type ProtocolDetail = {
  name: string
  url: string
}

// 테이블과 다이얼로그에서 사용할 처리된 미러 정보
type MirrorInfo = {
  name: string
  host: string
  country: string
  bandwidth: string
  protocols: ProtocolDetail[] // 모든 활성 프로토콜
  url: string // Primary URL (https > http > rsync)
}

// API 응답의 원시 프로토콜 정보
type RawProtocol = {
  url: string
}

// API 응답의 원시 미러 정보
type RawMirror = {
  name: string
  host: string
  bandwidth: string
  protocols: Record<string, RawProtocol>
}

type ApiResponse = Record<string, RawMirror[]>

// --- Column Definitions ---

const columns: ColumnDef<MirrorInfo>[] = [
  {
    header: "이름",
    accessorKey: "name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    meta: {
      filterVariant: "text",
    },
  },
  {
    header: "호스트",
    accessorKey: "host",
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
        header: "대역폭",
        accessorKey: "bandwidth",
        meta: {
            filterVariant: "text",
        },
    },
  {
    header: "프로토콜",
    accessorKey: "protocols",
    cell: ({ row }) => {
      const protocols = row.getValue("protocols") as ProtocolDetail[]
      // 프로토콜 이름이 없는 경우를 대비하여 필터링
      return (
        <div className="flex gap-2">
          {protocols.map(p => p.name).filter(Boolean).join(" | ")}
        </div>
      )
    },
    meta: {
      filterVariant: "select",
    },
    filterFn: (row, id, filterValue) => {
      const rowProtocols = row.getValue(id) as ProtocolDetail[]
      return rowProtocols.some(p => p.name === (filterValue as string))
    },
    enableSorting: false,
  },
  {
    header: "바로가기",
    accessorKey: "url",
    cell: ({ row }) => (
      <a
        href="#"
      >
        <ExternalLinkIcon size={16} aria-hidden="true" />
      </a>
    ),
    enableSorting: false,
  },
]

export { columns }
export type { MirrorInfo, ProtocolDetail, RawMirror, RawProtocol, ApiResponse }
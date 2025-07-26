// index.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  MultipleSelector,
  Option,
} from "@/components/multiple-selector"
import {
  type MirrorInfo,
  ProtocolDetail,
  RawMirror,
  ApiResponse,
  columns,
} from "./type"
import Filter from "./Filter"

// --- Main Component ---

export default function UbuntuCDMirrorTable() {
  const [rawData, setRawData] = useState<ApiResponse | null>(null)
  const [countries, setCountries] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<Option[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  // 기본 정렬 기준을 score에서 country로 변경
  const [sorting, setSorting] = useState<SortingState>([
    { id: "country", desc: false },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMirrorDetails, setSelectedMirrorDetails] =
    useState<MirrorInfo | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // API 주소 변경
        const response = await fetch("/api/mirrorlist/ubuntu/cd")
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

  const countryOptions: Option[] = useMemo(
    () => countries.map(c => ({ value: c, label: c })),
    [countries]
  )

  const processedData = useMemo<MirrorInfo[]>(() => {
    if (!rawData) return []

    const processMirror = (
      mirror: RawMirror,
      country: string
    ): MirrorInfo | null => {
      const relevantProtocols = ["http", "https", "rsync"]

      // score나 active가 없으므로 모든 프로토콜을 가져옴
      const allProtocols: ProtocolDetail[] = Object.entries(
        mirror.protocols
      ).map(([protocolName, protocolDetails]) => ({
        name: protocolName,
        url: protocolDetails.url,
      }))

      if (allProtocols.length === 0) return null

      const relevantProtocolDetails = allProtocols.filter(p =>
        relevantProtocols.includes(p.name)
      )

      let primaryUrl: string = "#"

      if (relevantProtocolDetails.length > 0) {
        // URL 우선순위 결정: https > http > rsync
        const httpsProtocol = relevantProtocolDetails.find(p => p.name === "https")
        const httpProtocol = relevantProtocolDetails.find(p => p.name === "http")
        const rsyncProtocol = relevantProtocolDetails.find(p => p.name === "rsync")

        if (httpsProtocol) {
          primaryUrl = httpsProtocol.url
        } else if (httpProtocol) {
          primaryUrl = httpProtocol.url
        } else if (rsyncProtocol) {
          primaryUrl = rsyncProtocol.url
        } else {
          primaryUrl = relevantProtocolDetails[0].url
        }
      } else if (allProtocols.length > 0) {
          // http, https, rsync는 없지만 다른 프로토콜이 있는 경우
          primaryUrl = allProtocols[0].url;
      }


      return {
        name: mirror.name,
        host: mirror.host,
        country: country,
        bandwidth: mirror.bandwidth,
        protocols: allProtocols, // 다이얼로그에 표시할 모든 프로토콜
        url: primaryUrl,
      }
    }

    const selectedValues = selectedCountries.map(c => c.value)

    let filteredMirrors: MirrorInfo[] = []

    if (selectedValues.length === 0) {
      filteredMirrors = Object.entries(rawData)
        .flatMap(([country, mirrors]) =>
          mirrors
            .map(mirror => processMirror(mirror, country))
            .filter((item): item is MirrorInfo => item !== null)
        )
    } else {
      filteredMirrors = selectedValues.flatMap(countryName => {
        const countryMirrors = rawData[countryName] || []
        return countryMirrors
          .map(mirror => processMirror(mirror, countryName))
          .filter((item): item is MirrorInfo => item !== null)
      })
    }
    return filteredMirrors
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

  const handleRowClick = (mirror: MirrorInfo) => {
    setSelectedMirrorDetails(mirror)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div className="text-center p-8">미러 데이터를 로딩 중입니다...</div>
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">오류: {error}</div>
  }

  return (
    <div className="p-4 sm:p-6 font-sans w-full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Ubuntu CD 미러 목록</h1>
        <p className="text-muted-foreground mb-4">
          각 행을 클릭하여 미러의 상세 프로토콜 정보를 확인하세요.
        </p>

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
                placeholder="국가 선택..."
                emptyIndicator={
                  <p className="text-center text-sm text-muted-foreground">
                    결과를 찾을 수 없습니다.
                  </p>
                }
              />
            </div>
          </div>

          {/* Filters */}
          <div className="w-full sm:w-44">
            <Filter column={table.getColumn("name")!} />
          </div>
          <div className="w-full sm:w-44">
            <Filter column={table.getColumn("host")!} />
          </div>
          <div className="w-full sm:w-36">
            <Filter column={table.getColumn("protocols")!} />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted/50 hover:bg-muted"
                >
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className="relative h-10 select-none"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
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
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => handleRowClick(row.original)}
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    선택된 기준에 대한 결과가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mirror Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedMirrorDetails?.name} 상세 정보</DialogTitle>
            <DialogDescription>
              이 미러에 대한 프로토콜별 상세 정보를 확인하세요.
            </DialogDescription>
          </DialogHeader>
          {selectedMirrorDetails && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-row gap-2 items-center">
                <Label className="text-right w-20 shrink-0">이름:</Label>
                <div>{selectedMirrorDetails.name}</div>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Label className="text-right w-20 shrink-0">호스트:</Label>
                <div>{selectedMirrorDetails.host}</div>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Label className="text-right w-20 shrink-0">국가:</Label>
                <div>{selectedMirrorDetails.country}</div>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Label className="text-right w-20 shrink-0">대역폭:</Label>
                <div>{selectedMirrorDetails.bandwidth}</div>
              </div>

              <h3 className="text-lg font-semibold mt-4 mb-2">
                사용 가능 프로토콜
              </h3>
              {selectedMirrorDetails.protocols.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>프로토콜</TableHead>
                        <TableHead>URL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedMirrorDetails.protocols.map(protocol => (
                        <TableRow key={protocol.name}>
                          <TableCell className="font-medium">
                            {protocol.name}
                          </TableCell>
                          <TableCell>
                            <a
                              href="#"
                            >
                              {protocol.url} <ExternalLinkIcon size={12} />
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  사용 가능한 프로토콜이 없습니다.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type HeaderGroup,
  type Row,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { useMemo, useRef, useState, type RefObject } from "react";
import { buildColumnMap, buildColumns } from "../components/dataPreviewColumns";
import type { ParsedFilePreview, PreviewColumn, PreviewRow } from "../types/files";

const ESTIMATED_ROW_HEIGHT = 44;
const VIRTUAL_OVERSCAN = 12;

type DataPreviewModel = {
  columnMap: Map<string, PreviewColumn>;
  globalFilter: string;
  headerGroups: HeaderGroup<PreviewRow>[];
  rows: Row<PreviewRow>[];
  scrollRef: RefObject<HTMLDivElement | null>;
  setGlobalFilter: (globalFilter: string) => void;
  totalSize: number;
  virtualRows: VirtualItem[];
};

/** Configure and return a TanStack table instance. */
function usePreviewTable(preview: ParsedFilePreview, globalFilter: string, setGlobalFilter: (value: string) => void) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo(() => buildColumns(preview.columns), [preview.columns]);

  return useReactTable({
    columns,
    data: preview.rows,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    state: { globalFilter, sorting },
  });
}

/** Configure and return a virtualizer for preview rows. */
function usePreviewVirtualizer(rowCount: number, scrollRef: RefObject<HTMLDivElement | null>) {
  return useVirtualizer({
    count: rowCount,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    getScrollElement: () => scrollRef.current,
    overscan: VIRTUAL_OVERSCAN,
  });
}

/** Build and return table state for the data preview UI. */
export function useDataPreviewTable(preview: ParsedFilePreview): DataPreviewModel {
  const [globalFilter, setGlobalFilter] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const table = usePreviewTable(preview, globalFilter, setGlobalFilter);
  const rows = table.getRowModel().rows;
  const virtualizer = usePreviewVirtualizer(rows.length, scrollRef);
  const columnMap = useMemo(() => buildColumnMap(preview.columns), [preview.columns]);

  return {
    columnMap,
    globalFilter,
    headerGroups: table.getHeaderGroups(),
    rows,
    scrollRef,
    setGlobalFilter,
    totalSize: virtualizer.getTotalSize(),
    virtualRows: virtualizer.getVirtualItems(),
  };
}

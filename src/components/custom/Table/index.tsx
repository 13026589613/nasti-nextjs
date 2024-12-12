"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { forwardRef, useImperativeHandle, useMemo } from "react";

import Pagination, { PaginationType } from "@/components/custom/Pagination";
import useDayViewWidth from "@/components/schedules/hooks/useDayViewWidth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import useAdaptive from "./hooks/useAdaptive";

interface CustomTableProps {
  children?: React.ReactNode;
  className?: string;
  columns: CustomColumnDef<any>[];
  data: any[];
  loading?: boolean;
  height?: string;
  scrollClassName?: string;
  // If adaptive is true, the height of the form is calculated dynamically.
  adaptive?: boolean;
  pagination?: PaginationType;
  changePageNum?: (pageNum: number) => void;
  changePageSize?: (pageSize: number) => void;
  manualPagination?: boolean;
  rowClassName?: (value: any) => any;
  headClass?: string;
  tableId?: string;
  rowKey?: string;
  scrollAreaRef?: React.RefObject<HTMLDivElement>;
  lightIndex?: Array<string> | string;
  enableRowSelection?: boolean | ((row: Row<any>) => boolean);
  tableClassName?: string;
  customPagination?: () => React.ReactNode;
}

export type CustomColumnDef<T> = ColumnDef<T> & {
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
};
export interface RefProps {
  querySelector: any;
  getSelectedRows: () => any[];
  clearSelectedRows: () => void;
  setRowSelection: (rowSelection: any) => void;
}

const CustomTable = (props: CustomTableProps, ref: React.Ref<unknown>) => {
  const {
    className,
    scrollClassName,
    columns,
    lightIndex,
    data,
    loading,
    height,
    adaptive,
    pagination,
    changePageNum,
    changePageSize,
    manualPagination,
    rowClassName,
    headClass,
    tableId,
    rowKey,
    scrollAreaRef,
    enableRowSelection,
    tableClassName,
    customPagination,
  } = props;

  const { adaptiveHeight } = useAdaptive(
    adaptive,
    !!(pagination || customPagination)
  );

  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    enableRowSelection,
    getRowId: (row: any) => (rowKey ? row[rowKey] : row.id),
    state: {
      rowSelection,
      pagination: {
        pageSize: pagination?.pageSize || 15,
        pageIndex: 0,
      },
    },
    manualPagination: manualPagination,
  });

  useImperativeHandle(ref, () => {
    return {
      table: table,
      setRowSelection: table.setRowSelection,
      getSelectedRows: () => {
        return table.getRowModel().rows.filter((row) => row.getIsSelected());
      },
      clearSelectedRows: () => {
        table.toggleAllPageRowsSelected(false);
      },
      scrollToRow: (index: number) => {
        const current = tableId && document.getElementById(tableId);
        if (!current) return;
        const row: any = current.querySelector(`[data-row-index="${index}"]`);
        if (row) {
          if (scrollAreaRef?.current) {
            scrollAreaRef?.current?.scrollTo({
              top: row.offsetTop - 48,
              behavior: "smooth",
            });
          }
        }
      },
    };
  });

  const headerRef = React.useRef<any>(null);

  const { wrapperHeight: headerHeight } = useDayViewWidth(headerRef);

  const tableHeight = useMemo(() => {
    if (adaptive) {
      return adaptiveHeight - headerHeight;
    } else {
      if (height) {
        if (!!(pagination || customPagination)) {
          return `calc(100% - ${headerHeight + 60}px)`;
        } else {
          return `calc(100% - ${headerHeight}px)`;
        }
      } else {
        return adaptiveHeight - headerHeight;
      }
    }
  }, [adaptiveHeight, headerHeight, height]);

  return (
    <div className={cn("custom-table", className)} id={tableId}>
      <Table
        scrollAreaRef={scrollAreaRef || undefined}
        className={cn("min-w-full w-full h-full block", tableClassName)}
        scrollClassName={scrollClassName}
        height={adaptive ? `${adaptiveHeight}px` : height}
      >
        <TableHeader
          ref={headerRef}
          className={cn(
            "bg-[#eeeeed] dark:bg-[#040401] table table-fixed w-full",
            headClass
          )}
        >
          {table.getHeaderGroups().map((headerGroup) => {
            return (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const { index } = header;
                  const setting = columns[index];
                  return (
                    <TableHead
                      style={{
                        width: setting.width,
                        minWidth: setting.minWidth,
                        maxWidth: setting.maxWidth,
                      }}
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
                <TableHead
                  style={{
                    width: "7px",
                    padding: 0,
                  }}
                ></TableHead>
              </TableRow>
            );
          })}
        </TableHeader>

        <TableBody
          style={{
            height: tableHeight,
          }}
          className="overflow-y-auto block"
          ref={scrollAreaRef as any}
        >
          {loading ? (
            <TableRow className="absolute top-[50%] left-[50%]">
              <TableCell>
                <Loader2 className="w-[30px] h-[30px] animate-spin" />
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, rowIndex) => {
              const isLight =
                row.getIsSelected() ||
                (lightIndex
                  ? Array.isArray(lightIndex)
                    ? lightIndex.includes(row.id)
                    : row.id === lightIndex
                  : false);
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    "table table-fixed w-full",
                    isLight && "bg-[#4EBBF51A!important]",
                    rowClassName && rowClassName(row.original)
                  )}
                  data-state={row.getIsSelected() && "selected"}
                  data-row-index={rowIndex}
                >
                  {row.getVisibleCells().map((cell, index) => {
                    const setting = columns[index];
                    return (
                      <TableCell
                        style={{
                          width: setting.width,
                          minWidth: setting.minWidth,
                          maxWidth: setting.maxWidth,
                        }}
                        key={cell.id}
                        className="text-wrap break-words"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <TableRow className="table table-fixed w-full">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div
        className={cn(
          "flex justify-end",
          !customPagination && pagination && pagination.total > 0 && "mt-[15px]"
        )}
      >
        {!customPagination && pagination && pagination.total > 0 && (
          <Pagination
            {...pagination}
            changePageNum={changePageNum}
            changePageSize={changePageSize}
          />
        )}
        {customPagination && <div>{customPagination()}</div>}
      </div>
    </div>
  );
};
export default forwardRef(CustomTable);

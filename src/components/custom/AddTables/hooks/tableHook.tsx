"use client";

import { Dispatch, SetStateAction } from "react";

import { CustomColumnDef } from "../../Table";
import AddTablesCell from "../components/AddTableCell";
import { TableColumn, TableDataItem } from "../types";

interface TableColumnProps {
  tableColumn: TableColumn[];
  tableData: TableDataItem[];
  setData: Dispatch<SetStateAction<TableDataItem[]>>;
}
const useReturnTableColumn = (props: TableColumnProps) => {
  const { setData, tableData, tableColumn } = props;
  const columns = tableColumn.map((item) => {
    return {
      accessorKey: item.key,
      header: () => {
        return (
          <div className="flex items-center cursor-pointer w-full h-full">
            {item.title}
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <AddTablesCell
            row={row}
            item={item}
            setData={setData}
            tableData={tableData}
          ></AddTablesCell>
        );
      },
    } as CustomColumnDef<TableDataItem>;
  });

  return {
    columns,
  };
};
export default useReturnTableColumn;

import { Dispatch, SetStateAction } from "react";

import CustomTable from "@/components/custom/Table";

import useReturnTableColumn from "./hooks/tableHook";
import { TableColumn, TableDataItem } from "./types";
interface TableProps {
  tableColumn: TableColumn[];
  tableData: TableDataItem[];
  setData: Dispatch<SetStateAction<TableDataItem[]>>;
}
export default function AddTables(params: TableProps) {
  const { tableColumn, tableData, setData } = params;
  const { columns } = useReturnTableColumn({ tableColumn, tableData, setData });
  return (
    <>
      <CustomTable
        columns={columns}
        data={tableData}
        loading={false}
        adaptive
      />
    </>
  );
}

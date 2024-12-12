import { Row } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import Input from "../../Input";
import { TableColumn, TableDataItem } from "../types";

interface AddTableCellProps {
  row: Row<TableDataItem>;
  item: TableColumn;
  tableData: TableDataItem[];
  setData: Dispatch<SetStateAction<TableDataItem[]>>;
}
export default function AddTablesCell(params: AddTableCellProps) {
  const { row, item, tableData, setData } = params;
  const [value, setValue] = useState(row.original[item.key]);
  useEffect(() => {
    setValue(row.original[item.key]);
  }, [row.original]);
  return (
    <div className="lowercase">
      <Input
        onBlur={(e) => {
          const newValue = e.target.value;
          const newData = tableData.map((data) => {
            if (data.id === row.original.id) {
              return { ...data, [item.key]: newValue };
            }
            return data;
          });
          setData(newData);
        }}
        onChange={(e) => {
          const value = e.target.value;
          setValue(value);
        }}
        value={value}
      />
    </div>
  );
}

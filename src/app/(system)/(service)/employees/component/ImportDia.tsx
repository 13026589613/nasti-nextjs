import { useRef, useState } from "react";

import CustomDialog from "@/components/custom/Dialog";
import CustomTable, { RefProps } from "@/components/custom/Table";

import useReturnTableColumn from "../hooks/ErrorFileColumn";
import { EmployeesVo, ErrorEntityType } from "../type";
interface ImportDiaProps {
  errTableData: ErrorEntityType[];
  open: boolean;
  editItem?: EmployeesVo | null;
  setToggleDailog: (value: boolean) => void;
}
const ImportDia = (props: ImportDiaProps) => {
  const { open, setToggleDailog, errTableData } = props;
  const tableRef = useRef<RefProps>();
  const [loading] = useState(false);
  const [defaultActiveKey] = useState("CurrentShifts");
  const { columns } = useReturnTableColumn({
    defaultActiveKey,
  });
  const [data] = useState<ErrorEntityType[]>(errTableData);

  return (
    <CustomDialog
      title="Upload Error Details"
      open={open}
      width="1120px"
      onClose={() => {
        setToggleDailog(false);
      }}
    >
      <div className="h-[560px] mt-[25px]">
        <CustomTable
          className="h-[560px]"
          adaptive={false}
          height="auto"
          columns={columns}
          data={data}
          loading={loading}
          ref={tableRef}
        />
      </div>
    </CustomDialog>
  );
};
export default ImportDia;

import { useState } from "react";
import { toast } from "react-toastify";

import ArrowBlock from "@/components/custom/ArrowBlock";
import CustomDialog from "@/components/custom/Dialog";

import CheckSearchList from "./CheckSearchList";
import WrapWorkTable from "./WrapWorkTable";
interface AssignAdminProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onClose: () => void;
  getLsit: () => void;
}
const listData = [
  {
    label: "Emma Johnson",
    value: 1,
    checked: false,
  },
  {
    label: "Emma Johnson",
    value: 2,
    checked: false,
  },
  {
    label: "Emma Johnson",
    value: 3,
    checked: false,
  },
  {
    label: "Emma Johnson",
    value: 4,
    checked: false,
  },
  {
    label: "Emma Johnson",
    value: 5,
    checked: false,
  },
  {
    label: "Emma Johnson",
    value: 6,
    checked: false,
  },
  {
    label: "Emma Johnson",
    value: 7,
    checked: false,
  },
  {
    label: "Emma Johnson",
    value: 8,
    checked: false,
  },
  {
    label: "Emma Johnson",
    value: 9,
    checked: false,
  },
  {
    label: "Emma Johnson",
    value: 10,
    checked: false,
  },
  {
    label: "Emma Johnson",
    value: 11,
    checked: false,
  },
  {
    label: "Emma Johnson1",
    value: 16,
    checked: false,
  },
  {
    label: "Emma Johnson",
    value: 17,
    checked: false,
  },
  {
    label: "Emma Johnson",
    value: 18,
    checked: false,
  },
];
const AssignAdminOrWorker = (props: AssignAdminProps) => {
  const { open, setOpen, onClose } = props;
  const [checkedArr, setCheckedArr] = useState(listData);
  const [userIndex, setUserIndex] = useState(-1);
  const [teamIndex, setTeamIndex] = useState(-1);
  function handleToggleArrow(type: number) {
    if (type == 1) {
      setUserIndex(1);
      toast.warning("Please select the data you want to manipulate.", {
        position: "top-center",
      });
    } else if (type == 2) {
      setUserIndex(2);
    } else if (type == 3) {
      setTeamIndex(3);
    } else {
      setTeamIndex(4);
    }
  }
  function showCheckList(data: any) {
    setCheckedArr(data);
  }
  function handleReload() {}
  return (
    <CustomDialog
      title="Assign Admin/Worker"
      open={open}
      onClose={() => {
        onClose();
        setOpen(false);
      }}
    >
      <div className="flex gap-[30px] flex-col">
        <div className="flex overflow-hidden ">
          <WrapWorkTable list={checkedArr} reload={() => handleReload}>
            <CheckSearchList list={checkedArr} showCheckList={showCheckList} />
          </WrapWorkTable>
          <div className="w-10">
            <div className="h-full flex items-center justify-center flex-col gap-1">
              <ArrowBlock
                active={userIndex == 1 ? true : false}
                type="right"
                onClick={() => handleToggleArrow(1)}
              />
              <ArrowBlock
                active={userIndex == 2 ? true : false}
                onClick={() => handleToggleArrow(2)}
              />
            </div>
          </div>
          <WrapWorkTable list={checkedArr}>
            <CheckSearchList list={checkedArr} showCheckList={showCheckList} />
          </WrapWorkTable>
        </div>
        <div className="flex overflow-hidden">
          <WrapWorkTable list={checkedArr}></WrapWorkTable>
          <div className="w-10">
            <div className="h-full flex items-center justify-center flex-col gap-1">
              <ArrowBlock
                active={teamIndex == 3 ? true : false}
                type="right"
                onClick={() => handleToggleArrow(3)}
              />
              <ArrowBlock
                active={teamIndex == 4 ? true : false}
                onClick={() => handleToggleArrow(4)}
              />
            </div>
          </div>
          <WrapWorkTable list={checkedArr}></WrapWorkTable>
        </div>
      </div>
    </CustomDialog>
  );
};
export default AssignAdminOrWorker;

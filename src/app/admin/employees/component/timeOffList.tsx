"use client";

import React, { useEffect, useState } from "react";

import Tabs from "@/components/custom/Tabs";
import XCloseIcon from "~/icons/XCloseIcon.svg";

import { EmployeesVo } from "../type";
import EditInfo from "./editInfo";
interface TimeOffListProps {
  setIsChild: (arg: boolean) => void;
  refreshList: () => void;
  editData: EmployeesVo | null;
  isView: boolean | undefined;
  isFocus: boolean;
}

export default function TimeOffList(props: TimeOffListProps) {
  const { refreshList, setIsChild, editData, isView, isFocus } = props;

  const [editItem, setEditItem] = useState<EmployeesVo | null>(null);

  useEffect(() => {
    if (editData) {
      setEditItem(editData);
    }
  }, [editData]);

  const [defaultActiveKey] = useState("employeeInfo");

  const btnList = [
    {
      label: "Employee Info",
      key: "employeeInfo",
    },
  ];

  function handleCloseChild() {
    setIsChild(false);
    refreshList();
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <span className="font-[450] text-[24px] text-[#324664]">
          Employee Detail -{" "}
          {`${editItem && editItem.firstName} ${editItem && editItem.lastName}`}
        </span>
        <XCloseIcon className="cursor-pointer" onClick={handleCloseChild} />
      </div>
      <div className="my-[30px]">
        <Tabs
          items={btnList}
          defaultActiveKey={defaultActiveKey}
          onclick={() => {}}
        />
      </div>
      <EditInfo
        isFocus={isFocus}
        isAdd={false}
        open={true}
        isView={isView}
        editItem={editItem}
      />
    </>
  );
}

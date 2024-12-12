"use client";

import { useSetState } from "ahooks";
import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";

import {
  bulkSendInvitationAdmin,
  deleteDataAdmin,
  getUserEmployessList,
} from "@/api/admin/employees";
import { getWorkDetails } from "@/api/employees";
import { OrderByType, PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable, { RefProps } from "@/components/custom/Table";
import Tabs from "@/components/custom/Tabs";
import PageTitle from "@/components/PageTitle";
import { MESSAGE } from "@/constant/message";
import ActiveUserIcon from "~/icons/ActiveUserIcon.svg";
import InactiveUserIcon from "~/icons/InactiveUserIcon.svg";
import PendingUserIcon from "~/icons/PendingUserIcon.svg";

import CheckInfo from "../component/CheckInfo";
import CreateDia from "../component/CreateDia";
import TableSearchForm from "../component/TableSearchForm";
import UploadFileList from "../component/UploadFileList";
import useReturnTableColumn from "../hooks/tableColumn";
import { EmployeesVo, SearchParams } from "../type";
import BulkEdit from "./BulkEdit";
interface PageListProps {
  setIsChild: (arg: boolean) => void;
  isChild: boolean;
  ref?: React.ReactHTML;
  isFocus: boolean;
  setIsEmployeeInfo: (value: boolean) => void;
  getEditData: (value: EmployeesVo) => void;
  setIsView: (value: boolean) => void;
  setIsFocus: (value: boolean) => void;
}

const PageList = (props: PageListProps, ref: any) => {
  const {
    isChild,
    isFocus,
    setIsChild,
    setIsEmployeeInfo,
    getEditData,
    setIsView,
    setIsFocus,
  } = props;

  const tableRef = useRef<RefProps>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<EmployeesVo | null>(null);
  const [data, setData] = useState<EmployeesVo[]>([]);
  const [orderBy, setOrderBy] = useState<OrderByType>([]);
  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Delete dialog open
  const [chooseWorkId, setChooseWorkId] = useState([]);
  const [status, setStatus] = useState("1");
  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    keywords: "",
    roleId: "",
    license: "",
    companyId: "",
    communityId: "",
    status: status,
  });
  const [deleteItem, setDeleteItem] = useState<EmployeesVo | null>(null); // Delete item
  const [employeeStatus, setEmployeeStatus] = useState("Active");
  const [isAdd, setIsAdd] = useState(true);

  const [infoOpen, setInfoOpen] = useState(false);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [clickBtn, setClickBtn] = useState("");

  useEffect(() => {
    if (!isChild) {
      setEditItem(null);
    }
  }, [isChild]);

  useImperativeHandle(ref, () => {
    return {
      getList,
    };
  });

  const [loadingData, setLoadingData] = useState(false);

  const getList = async () => {
    try {
      setLoadingData(true);
      const res = await getUserEmployessList({
        keywords:
          searchParams.keywords === "" ? undefined : searchParams.keywords,
        roleId: searchParams.roleId === "" ? undefined : searchParams.roleId,
        license: searchParams.license === "" ? undefined : searchParams.license,
        companyId:
          searchParams.companyId === "" ? undefined : searchParams.companyId,
        communityId:
          searchParams.communityId === ""
            ? undefined
            : searchParams.communityId,
        status: searchParams.status,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      });

      if (res.code === 200 && res.data) {
        const { records, total } = res.data;
        setData(records);
        setPagination({
          total: total,
        });
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    getList();
  }, [pagination.pageNum, pagination.pageSize]);

  useEffect(() => {
    if (pagination.pageNum === 1) {
      getList();
    } else {
      setPagination({
        pageNum: 1,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    getList();
  }, []);

  function handleCallDetails(row: any) {
    getListDetails(row);
  }

  const sendInvite = async (list: string[], type?: string | undefined) => {
    if (type == "1") {
      setBtnLoading(true);
    }

    const res = await bulkSendInvitationAdmin(list);
    if (res.code === 200) {
      if (type == "1") {
        setBtnLoading(false);
      }

      toast.success(MESSAGE.invitationSent, { position: "top-center" });
      getList();
    }
  };

  const [currentBtn, setCurrentBtn] = useState("Active");

  const { columns } = useReturnTableColumn({
    orderBy,
    pagination,
    setEditDialogOpen,
    setEditItem,
    setOrderBy,
    getList,
    employeeStatus,
    setIsAdd,
    setInfoOpen,
    handleCallDetails,
    setIsChild,
    sendInvite,
    setDeleteItem,
    setDeleteDialogOpen,
    setIsEmployeeInfo,
    setIsView,
    setIsFocus,
  });

  const btnList = [
    {
      label: "Active",
      value: "Active",
      key: "Active",
      status: "1",
      icon: <ActiveUserIcon />,
    },
    {
      label: "Inactive",
      value: "Inactive",
      key: "Inactive",
      status: "0",
      icon: <InactiveUserIcon />,
    },
    {
      label: "Pending",
      value: "Pending",
      key: "Pending",
      status: "2",
      icon: <PendingUserIcon />,
    },
  ];

  function handleClickBtn(key: string) {
    if (!loadingData) {
      const value: any = btnList.find((item) => item.key == key);
      setEmployeeStatus(value.value);
      setCurrentBtn(value.value);
      setStatus(value.status);
      setSearchParams({
        status: value.status == "2" ? "3,4" : value.status,
      });
    }
  }

  const [bulkEditCommunityId, setBulkEditCommunityId] = useState("");

  function handleBtn(value: string) {
    if (value === "add") {
      setIsAdd(true);
      setEditDialogOpen(true);
      setIsFocus(false);
    } else if (value === "upload") {
      setShowImport(true);
    } else if (value === "send") {
      setClickBtn("send");
      const choseData: any = tableRef.current?.getSelectedRows();

      const idsArr = choseData.map(
        (item: any) => item.original.userCommunityRefId
      );

      sendInvite(idsArr, "1");
    } else if (value === "edit") {
      const choseData: any = tableRef.current?.getSelectedRows();

      const length = choseData.length;

      let communityId: string = "";

      for (let index = 0; index < length; index++) {
        const element = choseData[index];
        setBulkEditCommunityId(element.original.userCommunityId);
        if (!communityId) {
          communityId = element.original.userCommunityId;
        } else {
          if (
            communityId != element.original.userCommunityId &&
            element.original.userCommunityId
          ) {
            toast.warning(
              "You cannot bulk edit employees from different communities.",
              {
                position: "top-center",
              }
            );
            return;
          }
        }
      }

      if (length === 0) {
        toast.warning("Please select at least one record.", {
          position: "top-center",
        });
        return;
      }
      const idsArr = choseData.map((item: any) => item.original.workerId);
      console.log(idsArr, "idsArr");

      setChooseWorkId(idsArr);
      setShowBatchEdit(true);
    }
  }

  const getListDetails = async (data: any) => {
    try {
      const res = await getWorkDetails(data.userId, data.userCommunityId);
      if (res.code === 200) {
        const result: any = res.data;
        getEditData(result);
        setEditItem(result);
      }
    } finally {
    }
  };

  const deleteItemHandler = (item: EmployeesVo) => {
    const id = [item.userCommunityId];
    deleteItemFn(id as string[]);
  };

  const deleteItemFn = async (id: string[]) => {
    const res = await deleteDataAdmin(id);
    if (res.code === 200) {
      toast.success(MESSAGE.delete, { position: "top-center" });
      getList();
    }
    setDeleteDialogOpen(false);
  };

  return (
    <Fragment>
      <PageTitle
        className="mb-[30px]"
        title="Community Employees"
        isClose={false}
      />
      <Tabs
        items={btnList}
        defaultActiveKey={currentBtn}
        isChangeActive={false}
        onclick={handleClickBtn}
      />
      <div className="mt-[10px]">
        <TableSearchForm
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          currentBtn={currentBtn}
          clickBtn={clickBtn}
          btnLoading={btnLoading}
          handleBtn={handleBtn}
        ></TableSearchForm>
      </div>

      {/* table */}
      <CustomTable
        columns={columns}
        data={data}
        loading={loadingData}
        adaptive
        ref={tableRef}
        rowKey="userCommunityRefId"
        pagination={pagination}
        changePageNum={(pageNum) => {
          setPagination({ pageNum });
        }}
        changePageSize={(pageSize) => {
          const nowSize = pagination.pageSize * (pagination.pageNum - 1) + 1;

          const pageNum = Math.ceil(nowSize / pageSize);

          setPagination({ ...pagination, pageSize, pageNum: pageNum });
        }}
      />

      {/* add or edit */}
      {editDialogOpen && (
        <CreateDia
          isFocus={isFocus}
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          editItem={editItem}
          isAdd={isAdd}
          currentBtn={currentBtn}
          communityId={editItem?.userCommunityId || ""}
          onClose={() => {
            setEditDialogOpen(false);
            setEditItem(null);
          }}
          getLsit={getList}
          handleClickBtn={handleClickBtn}
        ></CreateDia>
      )}

      {/* batch edit */}
      {showBatchEdit && (
        <BulkEdit
          open={showBatchEdit}
          setOpen={setEditDialogOpen}
          editItem={null}
          communityId={bulkEditCommunityId}
          chooseWorkId={chooseWorkId}
          onClose={() => {
            setShowBatchEdit(false);
            setEditItem(null);
          }}
          getLsit={getList}
        ></BulkEdit>
      )}

      {/* look details info  */}
      {infoOpen && (
        <CheckInfo
          open={infoOpen}
          setOpen={setEditDialogOpen}
          editItem={editItem}
          communityId={editItem?.userCommunityId || ""}
          onClose={() => {
            setEditItem(null);
            setInfoOpen(false);
          }}
        ></CheckInfo>
      )}

      {/* upload file dialog */}
      {showImport && (
        <UploadFileList
          open={showImport}
          setOpen={setShowImport}
          editItem={editItem}
          isAdd={isAdd}
          handleRefreshList={getList}
          onClose={() => {
            setShowImport(false);
            setEditItem(null);
          }}
          getLsit={getList}
          handleClickBtn={handleClickBtn}
        ></UploadFileList>
      )}

      {/* Operate Confirm */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
        }}
        onOk={() => {
          deleteItemHandler(deleteItem as EmployeesVo);
        }}
      >
        Are you sure you want to delete this item?
      </ConfirmDialog>
    </Fragment>
  );
};
export default forwardRef(PageList);

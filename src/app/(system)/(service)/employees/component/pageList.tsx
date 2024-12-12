"use client";

import { useSetState } from "ahooks";
import { usePathname } from "next/navigation";
import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";

import { createChannel } from "@/api/chat";
import {
  bulkSendInvitation,
  deleteData,
  getEmployeeListPage,
  getWorkDetails,
} from "@/api/employees";
import { OrderByType, PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable, { RefProps } from "@/components/custom/Table";
import Tabs from "@/components/custom/Tabs";
import PageTitle from "@/components/PageTitle";
import { MESSAGE } from "@/constant/message";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalDepartment from "@/hooks/useGlobalDepartmentId";
import useDepartmentStore from "@/store/useDepartmentStore";
import ActiveUserIcon from "~/icons/ActiveUserIcon.svg";
import InactiveUserIcon from "~/icons/InactiveUserIcon.svg";
import PendingUserIcon from "~/icons/PendingUserIcon.svg";

import { ChannelListResponse } from "../../messages/type";
import ChatDia from "../../shiftsNeedHelp/components/ChatDia";
import CheckInfo from "../component/CheckInfo";
import CreateDia from "../component/CreateDia";
import DoButton from "../component/doButton";
import TableSearchForm from "../component/TableSearchForm";
import UploadFileList from "../component/UploadFileList";
import useReturnTableColumn from "../hooks/tableColumn";
import { EmployeesVo, GetTypeEmployeeParams, SearchParams } from "../type";
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

  const { communityId } = useGlobalCommunityId();

  const { departmentIds } = useGlobalDepartment();

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
  const pathname = usePathname();
  const { department, getDepartmentIds } = useDepartmentStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Delete dialog open
  const [chooseWorkId, setChooseWorkId] = useState([]);
  const [status, setStatus] = useState("1");
  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    keywords: "",
    roleId: "",
    license: "",
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
      let orderByString = "";
      orderBy.forEach((item) => {
        orderByString = `${item.key} ${item.order}`;
      });
      const res = await getEmployeeListPage({
        ...searchParams,
        communityId: communityId,
        departmentIds: departmentIds,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        orderBy: orderByString,
      } as GetTypeEmployeeParams);

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
    const ids = getDepartmentIds(pathname);
    setSearchParams({
      departmentIds: ids ? ids.join(",") : "",
    });
  }, [department]);

  useEffect(() => {
    setPagination({
      pageNum: 1,
    });
  }, [orderBy]);

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
  }, [communityId]);

  function handleCallDetails(row: any) {
    getListDetails(row);
  }
  const sendInvite = async (list: any, type?: string | undefined) => {
    if (type == "1") {
      setBtnLoading(true);
    }

    const res = await bulkSendInvitation(list, communityId);
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
  function handleBtn(value: string) {
    if (value === "add") {
      setIsAdd(true);
      setEditDialogOpen(true);
      setIsFocus(false);
    } else if (value === "upload") {
      setShowImport(true);
    } else if (value === "message") {
      const choseData: any = tableRef.current?.getSelectedRows();

      const length = choseData.length;
      if (length === 0) {
        toast.warning("Please select at least one record.");
        return;
      }

      handleChatModalOpen(choseData.map((item: any) => item.original.userId));
    } else if (value === "send") {
      setClickBtn("send");
      const choseData: any = tableRef.current?.getSelectedRows();

      const length = choseData.length;
      if (length === 0) {
        toast.warning("Please select at least one record.");
        return;
      }

      const idsArr = choseData.map((item: any) => item.original.userId);
      sendInvite(idsArr, "1");
    } else if (value === "edit") {
      const choseData: any = tableRef.current?.getSelectedRows();

      const length = choseData.length;
      if (length === 0) {
        toast.warning("Please select at least one record.", {
          position: "top-center",
        });
        return;
      }
      const idsArr = choseData.map((item: any) => item.original.workerId);
      setChooseWorkId(idsArr);
      setShowBatchEdit(true);
    }
  }

  const getListDetails = async (data: any) => {
    try {
      const res = await getWorkDetails(data.userId, communityId);
      if (res.code === 200) {
        const result: any = res.data;
        getEditData(result);
        setEditItem(result);
      }
    } finally {
    }
  };
  /**
   * @description Fn - Delete Dialog
   * @param params
   */
  const deleteItemHandler = (item: EmployeesVo) => {
    const id = [item.userCommunityRefId];
    deleteItemFn(id as string[]);
  };
  /**
   * @description API - Delete One Data
   * @param params
   */
  const deleteItemFn = async (id: string[]) => {
    const res = await deleteData(id);
    if (res.code === 200) {
      toast.success(MESSAGE.delete, { position: "top-center" });
      getList();
    }
    setDeleteDialogOpen(false);
  };

  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [channelData, setChannelData] = useState<ChannelListResponse | null>(
    null
  );

  const handleChatModalOpen = async (useList: string[]) => {
    try {
      setLoading(true);
      const res = await createChannel({
        userIds: useList,
        communityId,
      });
      if (res.code === 200) {
        setChannelData(res.data[0]);
        setChatModalOpen(true);
        tableRef.current?.clearSelectedRows();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <PageTitle className="mb-[30px]" title="Employees" isClose={false} />
      <Tabs
        items={btnList}
        defaultActiveKey={currentBtn}
        isChangeActive={false}
        onclick={handleClickBtn}
      />
      <div className="mt-[30px]">
        <TableSearchForm
          communityId={communityId}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          currentBtn={currentBtn}
        ></TableSearchForm>
      </div>
      {/* btn */}
      {/* upload input file */}
      <DoButton
        clickBtn={clickBtn}
        btnLoading={btnLoading}
        onClick={handleBtn}
        messageLoading={loading}
        currentBtn={currentBtn}
        className="mb-[30px] mt-[30px]"
      />
      {/* table */}
      <div className="h-[calc(100%-200px)]">
        <CustomTable
          columns={columns}
          data={data}
          loading={loadingData}
          adaptive
          ref={tableRef}
          rowKey="userId"
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
      </div>
      {/* add or edit */}
      {editDialogOpen && (
        <CreateDia
          isFocus={isFocus}
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          editItem={editItem}
          isAdd={isAdd}
          currentBtn={currentBtn}
          communityId={communityId}
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
          communityId={communityId}
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
          communityId={communityId}
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
          communityId={communityId}
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

      {chatModalOpen && (
        <ChatDia
          currentChannel={channelData}
          onClose={() => {
            setChatModalOpen(false);
          }}
        ></ChatDia>
      )}
    </Fragment>
  );
};
export default forwardRef(PageList);

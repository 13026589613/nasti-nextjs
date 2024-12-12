"use client";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useImmer } from "use-immer";
import { useShallow } from "zustand/react/shallow";

import {
  activeAdminUser,
  deleteAdminUser,
  getAdminUserList,
  inviteAdminUser,
} from "@/api/adminUser";
import { OrderByType, PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import Spin from "@/components/custom/Spin";
import CustomTable, { RefProps } from "@/components/custom/Table";
import { MESSAGE } from "@/constant/message";
import { ADMIN_USER_STATUS } from "@/constant/statusConstants";
import useUserStore from "@/store/useUserStore";

import useReturnTableColumn, { AdminUserIconType } from "../hooks/tableColumn";
import { AdminUserSearchParams, AdminUserVo } from "../types";
import ApproveDia from "./approveDia";
import CreateDia from "./CreateDia";
import InactiveDia from "./InactiveDia";
import TableSearchForm from "./TableSearchForm";
import AdminUserViewDia from "./viewDia";
/**
 * @description UserCommunityRef List Manager Page
 * @returns
 */
interface AdminUserIndexProps {
  communityId?: string;
}

export default function AdminUserIndex(props: AdminUserIndexProps) {
  const { communityId } = props;
  const tableRef = useRef<RefProps>(); // Table ref
  const [approveDialogOpen, setApproveDialogOpen] = useState(false); // Approve dialog open
  const [operateItem, setOperateItem] = useState<AdminUserVo | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false); // Edit dialog open
  const [viewDialogOpen, setViewDialogOpen] = useState(false); // View dialog open
  const [data, setData] = useState<AdminUserVo[]>([]); // Data
  const [orderBy, setOrderBy] = useState<OrderByType>([]); // OrderBy
  const [userInfoItemEditable, setUserInfoItemEditable] = useState(false); //first name,last name,phone number is editable
  const [loading, setLoading] = useImmer<{
    pageLoading: boolean;
    tableLoading: boolean;
    inviteLoading: boolean;
  }>({
    pageLoading: false,
    tableLoading: false,
    inviteLoading: false,
  });
  const [optionDia, setOptionDia] = useImmer<{
    delete: boolean;
    active: boolean;
    inactive: boolean;
    sendInvitation: boolean;
  }>({
    delete: false,
    active: false,
    inactive: false,
    sendInvitation: false,
  }); // Option dialog open

  const [diaBtnLoading, setDiaBtnLoading] = useImmer<{
    deleteLoading: boolean;
    active: boolean;
    inactive: boolean;
    sendInvitation: boolean;
  }>({
    deleteLoading: false,
    active: false,
    inactive: false,
    sendInvitation: false,
  }); // Dialog button loading
  // Pagination
  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });
  // Search params
  const [searchParams, setSearchParams] = useSetState<AdminUserSearchParams>(
    {}
  );

  const { operateCommunity } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const getList = async () => {
    setLoading((draft) => {
      draft.tableLoading = true;
    });
    try {
      let orderByString = "";
      orderBy.forEach((item: any) => {
        orderByString = `${item.key} ${item.order}`;
      });
      const res = await getAdminUserList({
        communityId: communityId ? communityId : operateCommunity.id,
        ...searchParams,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        orderBy: orderByString,
      });
      if (res.code === 200) {
        // res.data.records.forEach((item: AdminUserVo) => {
        //   item.status = 2;
        // });
        setData(res.data.records);
        setPagination({
          total: res.data.total,
        });
      }
    } finally {
      setLoading((draft) => {
        draft.tableLoading = false;
      });
    }
  };

  const deleteItemFn = async (id: string) => {
    setDiaBtnLoading((draft) => {
      draft.deleteLoading = true;
    });
    setDiaBtnLoading((draft) => {
      draft.deleteLoading = true;
    });
    try {
      const res = await deleteAdminUser(id);
      if (res.code === 200) {
        toast.success(MESSAGE.delete, {
          position: "top-center",
        });
        getList();
      }
    } finally {
      setDiaBtnLoading((draft) => {
        draft.deleteLoading = false;
      });
      setOptionDia((draft) => {
        draft.delete = false;
      });
      setOperateItem(null);
    }
  };

  const deleteItemHandler = (item: AdminUserVo) => {
    deleteItemFn(item.id);
  };

  const inviteUsers = async () => {
    setLoading((draft) => {
      draft.inviteLoading = true;
    });

    let selectedRows: AdminUserVo[] = [];
    if (tableRef.current) {
      selectedRows = tableRef.current?.getSelectedRows();
    }

    if (selectedRows && selectedRows.length === 0) {
      toast.warning("Please select at least one record.", {
        position: "top-center",
      });
      setLoading((draft) => {
        draft.inviteLoading = false;
      });
    } else {
      try {
        const params = {
          ids: selectedRows
            ? selectedRows.map((item: AdminUserVo) => item.id as string)
            : [],
          redirectUrl: location.origin,
        };
        const res = await inviteAdminUser(params);
        if (res.code === 200) {
          toast.success(MESSAGE.sentInvitation, {
            position: "top-center",
          });
          getList();
          tableRef.current?.clearSelectedRows();
        }
      } finally {
        setLoading((draft) => {
          draft.inviteLoading = false;
        });
      }
    }
  };

  const optionIconClick = (item: AdminUserVo, type: AdminUserIconType) => {
    setOperateItem(item);
    if (type === "approval") {
      setApproveDialogOpen(true);
    } else if (type === "active") {
      setOptionDia((draft) => {
        draft.active = true;
      });
    } else if (type === "inactive") {
      setOptionDia((draft) => {
        draft.inactive = true;
      });
    } else if (type === "sendInvitation") {
      setOptionDia((draft) => {
        draft.sendInvitation = true;
      });
    } else if (type === "delete") {
      setOptionDia((draft) => {
        draft.delete = true;
      });
    } else if (type === "edit") {
      setUserInfoItemEditable(
        ["Active", "Inactive"].includes(ADMIN_USER_STATUS[item.status])
      );
      setEditDialogOpen(true);
    } else if (type === "view") {
      setViewDialogOpen(true);
    }
  };

  const activeUser = async (id: string) => {
    setDiaBtnLoading((draft) => {
      draft.active = true;
    });
    try {
      const res = await activeAdminUser(id);
      if (res.code === 200) {
        toast.success(MESSAGE.activate, {
          position: "top-center",
        });
        getList();
      }
    } finally {
      setDiaBtnLoading((draft) => {
        draft.active = false;
      });
      setOptionDia((draft) => {
        draft.active = false;
      });
      setOperateItem(null);
    }
  };

  const sendInvitation = async (id: string) => {
    setDiaBtnLoading((draft) => {
      draft.sendInvitation = true;
    });
    try {
      const res = await inviteAdminUser({
        ids: [id],
        redirectUrl: location.origin,
      });
      if (res.code === 200) {
        toast.success(MESSAGE.sentInvitation, {
          position: "top-center",
        });
        getList();
      }
    } finally {
      setDiaBtnLoading((draft) => {
        draft.sendInvitation = false;
      });
      setOptionDia((draft) => {
        draft.sendInvitation = false;
      });
      setOperateItem(null);
    }
  };
  useEffect(() => {
    setPagination({
      pageNum: 1,
    });
  }, [orderBy]);

  useEffect(() => {
    getList();
  }, [pagination.pageNum, pagination.pageSize, orderBy]);

  useEffect(() => {
    if (pagination.pageNum === 1) {
      getList();
    } else {
      setPagination({
        pageNum: 1,
      });
    }
  }, [searchParams]);

  // Table column
  const { columns, columnsLess } = useReturnTableColumn({
    orderBy,
    setOrderBy,
    optionIconClick,
  });
  // List Page
  return (
    <Spin loading={loading.pageLoading}>
      <>
        <div className="text-[rgba(50,70,100,1)] font-[450] text-[24px] mb-3">
          Admin Users
        </div>
        {/* Table Search */}
        <TableSearchForm
          loading={loading}
          setLoading={setLoading}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          add={() => {
            setOperateItem(null);
            setEditDialogOpen(true);
          }}
          invite={inviteUsers}
        ></TableSearchForm>
        <CustomTable
          columns={searchParams.status == 0 ? columns : columnsLess}
          data={data}
          loading={loading.tableLoading}
          adaptive
          ref={tableRef}
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
        {/* Operate Confirm */}
        <ConfirmDialog
          btnLoading={diaBtnLoading.deleteLoading}
          open={optionDia.delete}
          onClose={() => {
            setOptionDia((draft) => {
              draft.delete = false;
            });
          }}
          onOk={() => {
            deleteItemHandler(operateItem as AdminUserVo);
          }}
        >
          Are you sure you want to delete this user?
        </ConfirmDialog>
        <InactiveDia
          open={optionDia.inactive}
          id={operateItem?.id as string}
          onClose={(refresh) => {
            setOptionDia((draft) => {
              draft.inactive = false;
            });
            setOperateItem(null);
            if (refresh) {
              getList();
            }
          }}
        ></InactiveDia>
        <ConfirmDialog
          btnLoading={diaBtnLoading.active}
          open={optionDia.active}
          onClose={() => {
            setOptionDia((draft) => {
              draft.active = false;
            });
          }}
          onOk={() => {
            activeUser((operateItem as AdminUserVo).id);
          }}
        >
          Are you sure you want to activate this user?
        </ConfirmDialog>

        <ConfirmDialog
          btnLoading={diaBtnLoading.sendInvitation}
          open={optionDia.sendInvitation}
          onClose={() => {
            setOptionDia((draft) => {
              draft.sendInvitation = false;
            });
          }}
          onOk={() => {
            sendInvitation((operateItem as AdminUserVo).id);
          }}
        >
          Are you sure you want to send invitation to this user?
        </ConfirmDialog>
        {/* Info Form */}
        <CreateDia
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          operateItem={operateItem}
          userInfoItemEditable={userInfoItemEditable}
          onClose={(isRefresh: boolean | undefined) => {
            if (isRefresh) {
              getList();
            }
            setUserInfoItemEditable(false);
            setOperateItem(null);
          }}
          getLsit={getList}
        ></CreateDia>
        <AdminUserViewDia
          open={viewDialogOpen}
          setOpen={setViewDialogOpen}
          id={operateItem?.id as string}
          onClose={(isRefresh: boolean | undefined) => {
            if (isRefresh) {
              getList();
            }
            setOperateItem(null);
          }}
        ></AdminUserViewDia>
        {approveDialogOpen && (
          <ApproveDia
            open={approveDialogOpen}
            setOpen={setApproveDialogOpen}
            userInfo={operateItem as AdminUserVo}
            refreshList={getList}
          ></ApproveDia>
        )}
      </>
    </Spin>
  );
}

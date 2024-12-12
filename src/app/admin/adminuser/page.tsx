"use client";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useImmer } from "use-immer";

import {
  deleteAdminUserAdmin,
  getCompanyList,
  inviteAdminUserAdmin,
} from "@/api/admin/adminuser";
import { ActiveSchdulerUser } from "@/api/admin/adminuser/index";
import {
  CommunityAdminUserParams,
  CommunityAdminUserSearchParams,
  RecordVo,
} from "@/api/admin/adminuser/type";
import { PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable, { RefProps } from "@/components/custom/Table";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import { MESSAGE } from "@/constant/message";
import { ADMIN_USER_STATUS } from "@/constant/statusConstants";

import ApproveDia from "./components/approveDia";
import CreateDia from "./components/CreateDia";
import InactiveDia from "./components/InactiveDia";
import TableSearchForm from "./components/SearchForm";
import AdminUserViewDia from "./components/viewDia";
import useReturnTableColumn, { AdminUserIconType } from "./hooks/tableColumn";

const CommunityAdminUser = () => {
  const tableRef = useRef<RefProps>();

  const [searchParams, setSearchParams] =
    useSetState<CommunityAdminUserSearchParams>({});

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

  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });

  const [loading, setLoading] = useImmer<{
    pageLoading: boolean;
    tableLoading: boolean;
    inviteLoading: boolean;
  }>({
    pageLoading: false,
    tableLoading: false,
    inviteLoading: false,
  });

  const [data, setData] = useState<RecordVo[]>([]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [operateItem, setOperateItem] = useState<RecordVo | null>(null);

  const [userInfoItemEditable, setUserInfoItemEditable] = useState(false); //first name,last name,phone number is editable

  const [viewDialogOpen, setViewDialogOpen] = useState(false); // View dialog open

  const [approveDialogOpen, setApproveDialogOpen] = useState(false); // Approve dialog open

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

  const optionIconClick = (item: RecordVo, type: AdminUserIconType) => {
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

  const sendInvitation = async (id: string) => {
    setDiaBtnLoading((draft) => {
      draft.sendInvitation = true;
    });
    try {
      const res = await inviteAdminUserAdmin({
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

  const activeUser = async (id: string) => {
    setDiaBtnLoading((draft) => {
      draft.active = true;
    });
    try {
      const res = await ActiveSchdulerUser(id);
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

  const deleteItemFn = async (id: string) => {
    setDiaBtnLoading((draft) => {
      draft.deleteLoading = true;
    });
    setDiaBtnLoading((draft) => {
      draft.deleteLoading = true;
    });
    try {
      const res = await deleteAdminUserAdmin(id);
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

  const deleteItemHandler = (item: RecordVo) => {
    deleteItemFn(item.id);
  };

  const inviteUsers = async () => {
    setLoading((draft) => {
      draft.inviteLoading = true;
    });

    let selectedRows: RecordVo[] = [];
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
            ? selectedRows.map((item: RecordVo) => item.id as string)
            : [],
          redirectUrl: location.origin,
        };
        const res = await inviteAdminUserAdmin(params);
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

  const { columns, columnsLess } = useReturnTableColumn({
    optionIconClick,
  });

  const getList = async (params?: CommunityAdminUserParams) => {
    setLoading((draft) => {
      draft.pageLoading = true;
      draft.tableLoading = true;
    });
    try {
      const res = await getCompanyList(
        params
          ? params
          : ({
              ...searchParams,
              pageNum: pagination.pageNum,
              pageSize: pagination.pageSize,
            } as CommunityAdminUserParams)
      );
      if (res.code === 200) {
        setData(res.data.records);

        setPagination({
          total: res.data.total,
        });
      }
    } finally {
      setLoading((draft) => {
        draft.pageLoading = false;
        draft.tableLoading = false;
      });
    }
  };

  const handlePageSize = (pageSize: number) => {
    const nowSize = pagination.pageSize * (pagination.pageNum - 1) + 1;
    const pageNum = Math.ceil(nowSize / pageSize);
    setPagination({ ...pagination, pageSize, pageNum: pageNum });
  };

  useEffect(() => {
    getList();
  }, [pagination.pageNum, pagination.pageSize]);

  useEffect(() => {
    if (pagination.pageNum === 1) {
      getList();
    } else {
      setPagination({ pageNum: 1 });
    }
  }, [searchParams]);

  return (
    <PageContainer className={"min-w-[1400px] relative"}>
      <>
        <PageTitle title="Community Admins" isClose={false} />

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
          changePageNum={(pageNum) => setPagination({ pageNum })}
          changePageSize={(pageSize) => handlePageSize(pageSize)}
        />

        {editDialogOpen && (
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
        )}

        {viewDialogOpen && (
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
        )}

        <InactiveDia
          open={optionDia.inactive}
          id={operateItem?.id as string}
          data={operateItem as RecordVo}
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
            activeUser((operateItem as RecordVo).id);
          }}
        >
          Are you sure you want to activate this user?
        </ConfirmDialog>

        <ConfirmDialog
          btnLoading={diaBtnLoading.deleteLoading}
          open={optionDia.delete}
          onClose={() => {
            setOptionDia((draft) => {
              draft.delete = false;
            });
          }}
          onOk={() => {
            deleteItemHandler(operateItem as RecordVo);
          }}
        >
          Are you sure you want to delete this user?
        </ConfirmDialog>
        {approveDialogOpen && (
          <ApproveDia
            open={approveDialogOpen}
            setOpen={setApproveDialogOpen}
            userInfo={operateItem as RecordVo}
            refreshList={getList}
          ></ApproveDia>
        )}
        <ConfirmDialog
          btnLoading={diaBtnLoading.sendInvitation}
          open={optionDia.sendInvitation}
          onClose={() => {
            setOptionDia((draft) => {
              draft.sendInvitation = false;
            });
          }}
          onOk={() => {
            sendInvitation((operateItem as RecordVo).id);
          }}
        >
          Are you sure you want to send invitation to this user?
        </ConfirmDialog>
      </>
    </PageContainer>
  );
};

export default CommunityAdminUser;

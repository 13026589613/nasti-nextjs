"use client";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useImmer } from "use-immer";

import {
  deleteCompany,
  editCompany,
  getCompanyList,
} from "@/api/admin/company";
import { CompanyParams, CompanyVo } from "@/api/admin/company/type";
import { PaginationType } from "@/api/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable, { RefProps } from "@/components/custom/Table";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
// import CategoryDia from "../pbjJob/components/AddCategory";
import { MESSAGE } from "@/constant/message";

import CreateDia from "./components/CreateDia";
import TableSearchForm from "./components/SearchForm";
import useReturnTableColumn, { CompanyIconType } from "./hooks/tableColumn";
import { CompanySearchParams } from "./types";
const Company = () => {
  const [loading, setLoading] = useImmer<{
    pageLoading: boolean;
    tableLoading: boolean;
  }>({
    pageLoading: false,
    tableLoading: false,
  });

  const tableRef = useRef<RefProps>();

  const optionIconClick = (item: CompanyVo, type: CompanyIconType) => {
    setEditItem(null);
    if (type === "edit") {
      setEditItem(item);
      setViewDialogOpen(true);
    } else if (type === "delete") {
      setEditItem({ ...item, type });
      setOptionDia((draft) => {
        draft.open = true;
        draft.content = MESSAGE.deleteCommpany;
      });
    } else if (type === "add") {
      setViewDialogOpen(true);
    } else if (type === "deactivate") {
      setEditItem({ ...item, type });
      if (item.isActive) {
        setOptionDia((draft) => {
          draft.open = true;
          draft.content = MESSAGE.deactivateCommpany;
        });
      }
    } else if (type === "activate") {
      setEditItem({ ...item, type });
      if (!item.isActive) {
        setOptionDia((draft) => {
          draft.open = true;
          draft.content = MESSAGE.activateCommpany;
        });
      }
    }
  };

  const [searchParams, setSearchParams] = useSetState<CompanySearchParams>({});

  const { columns } = useReturnTableColumn({ optionIconClick });

  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });

  const [data, setData] = useState<CompanyVo[]>([]);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [editItem, setEditItem] = useState<CompanyVo | null>(null);

  const [optionDia, setOptionDia] = useImmer<{
    open: boolean;
    content: string;
  }>({
    open: false,
    content: "",
  });

  const [diaBtnLoading, setDiaBtnLoading] = useImmer<{
    deleteLoading: boolean;
  }>({
    deleteLoading: false,
  });

  const itemHandler = (item: CompanyVo) => {
    if (item.type === "deactivate" || item.type === "activate") {
      edit(item);
    } else if (item.type === "delete") {
      deleteItemFn(item?.id);
    }
  };

  const edit = async (item: CompanyVo) => {
    setDiaBtnLoading((draft) => {
      draft.deleteLoading = true;
    });
    try {
      const res = await editCompany({
        name: item.name,
        isActive: !item.isActive,
        id: item.id,
      });
      if (res.code === 200 && res.data) {
        toast.success(
          item.type === "activate"
            ? "Activated successfully."
            : "Deactivated successfully.",
          { position: "top-center" }
        );
        getList();
      }
    } finally {
      setOptionDia((draft) => {
        draft.open = false;
      });
      setDiaBtnLoading((draft) => {
        draft.deleteLoading = false;
      });
    }
  };

  const deleteItemFn = async (ids: string) => {
    setDiaBtnLoading((draft) => {
      draft.deleteLoading = true;
    });
    try {
      const res = await deleteCompany(ids);
      if (res.code === 200) {
        toast.success(MESSAGE.delete, {
          position: "top-center",
        });
      }
      getList();
    } finally {
      setDiaBtnLoading((draft) => {
        draft.deleteLoading = false;
      });
      setOptionDia((draft) => {
        draft.open = false;
      });
    }
  };

  const handlePageSize = (pageSize: number) => {
    const nowSize = pagination.pageSize * (pagination.pageNum - 1) + 1;
    const pageNum = Math.ceil(nowSize / pageSize);
    setPagination({ ...pagination, pageSize, pageNum: pageNum });
  };

  const getList = async (params?: CompanyParams) => {
    setLoading((draft) => {
      draft.tableLoading = true;
    });
    try {
      const res = await getCompanyList(
        params
          ? params
          : ({
              ...searchParams,
              isActive: !searchParams.isActive
                ? null
                : searchParams.isActive === "ACTIVE"
                ? true
                : false,
              pageNum: pagination.pageNum,
              pageSize: pagination.pageSize,
            } as CompanyParams)
      );
      if (res.code === 200) {
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

  useEffect(() => {
    getList();
  }, []);

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
        <PageTitle title="Companies" className="mb-6" isClose={false} />

        <TableSearchForm
          loading={loading}
          setLoading={setLoading}
          searchParams={searchParams}
          setSearchParams={(searchParams) => {
            setSearchParams(searchParams);
          }}
          add={() => {
            setViewDialogOpen(true);
          }}
        />
        <CustomTable
          columns={columns}
          data={data}
          loading={loading.tableLoading}
          adaptive
          ref={tableRef}
          pagination={pagination}
          changePageNum={(pageNum) => setPagination({ pageNum })}
          changePageSize={(pageSize) => handlePageSize(pageSize)}
        />

        <CreateDia
          open={viewDialogOpen}
          setOpen={setViewDialogOpen}
          editItem={editItem}
          onClose={() => {
            setEditItem(null);
          }}
          getList={getList}
        ></CreateDia>

        <ConfirmDialog
          btnLoading={diaBtnLoading.deleteLoading}
          open={optionDia.open}
          onClose={() => {
            setOptionDia((draft) => {
              draft.open = false;
            });
          }}
          onOk={() => {
            itemHandler(editItem as CompanyVo);
          }}
        >
          {optionDia.content}
        </ConfirmDialog>
      </>
    </PageContainer>
  );
};

export default Company;

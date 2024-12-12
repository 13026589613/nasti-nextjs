"use client";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useImmer } from "use-immer";

import { getNameListPbjCatrgoty } from "@/api/admin/pbjJob/index";
import { GetPbjJobParams } from "@/api/admin/pbjJob/type";
import { SearchParams } from "@/api/admin/pbjJob/type";
import { deletePbjJob, getPbjJob } from "@/api/pbjJob";
import {
  // OrderByType,
  PaginationType,
} from "@/api/types";
import { OptionType } from "@/components/custom/AddSelect";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable, { RefProps } from "@/components/custom/Table";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import { MESSAGE } from "@/constant/message";

import CreateDia from "./components/CreateDia";
import PBJJobsList from "./components/PBJJobsList";
import TableSearchForm from "./components/TableSearchForm";
import useReturnTableColumn from "./hooks/tableColumn";
// import { CompanyIconType } from "./hooks/tableColumn";
import { PbjJobVo } from "./types";
export default function PbjJobPage() {
  const [loading, setLoading] = useImmer<{
    pageLoading: boolean;
    tableLoading: boolean;
  }>({
    pageLoading: false,
    tableLoading: false,
  });
  const tableRef = useRef<RefProps>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<PbjJobVo | null>(null);
  const [delLoading, setDelLoading] = useState(false);
  const [data, setData] = useState<PbjJobVo[]>([]);

  // const [orderBy, setOrderBy] = useState<OrderByType>([]);
  const [type, _setType] = useState("");
  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });
  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    categoryName: "",
    code: "",
    name: "",
  });
  const [categoryList, setCateGoryList] = useState<string[]>([]);
  const [categoryTransitionList, setCategoryTransitionList] = useState<
    OptionType[]
  >([]);

  const getList = async (params?: GetPbjJobParams) => {
    setLoading((draft) => {
      draft.tableLoading = true;
    });
    try {
      const res = await getPbjJob(
        params
          ? params
          : ({
              ...searchParams,
              pageNum: pagination.pageNum,
              pageSize: pagination.pageSize,
            } as GetPbjJobParams)
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

  const deleteItemFn = async (id: string) => {
    setDelLoading(true);
    try {
      const res = await deletePbjJob(id);
      if (res.code === 200) {
        toast.success(MESSAGE.delete, { position: "top-center" });
        getList();
      }
      setDeleteDialogOpen(false);
    } finally {
      setDelLoading(false);
    }
  };

  const deleteItemHandler = (item: PbjJobVo) => {
    deleteItemFn(item.id);
  };

  // const optionIconClick = (item: PbjJobVo, type: CompanyIconType) => {
  //   setType(type);
  //   if (type === "view") {
  //     setEditDialogOpen(true);
  //   } else if (type === "delete") {
  //     setEditItem(item);
  //     setDeleteDialogOpen(true);
  //   } else if (type === "edit") {
  //     setEditItem(item);
  //     setEditDialogOpen(true);
  //   }
  // };

  const { columns } = useReturnTableColumn();
  //   {
  //   orderBy,
  //   pagination,
  //   searchParams,
  //   optionIconClick,
  //   setDeleteDialogOpen,
  //   setEditDialogOpen,
  //   setEditItem,
  //   setOrderBy,
  //   getList,
  // }

  const handlePageSize = (pageSize: number) => {
    const nowSize = pagination.pageSize * (pagination.pageNum - 1) + 1;
    const pageNum = Math.ceil(nowSize / pageSize);
    setPagination({ ...pagination, pageSize, pageNum: pageNum });
  };
  const getNameList = async () => {
    try {
      const { code, data } = await getNameListPbjCatrgoty();
      if (code === 200) {
        let list = data.map((item: string) => {
          return {
            label: item,
            value: item,
            __isNew__: false,
          };
        });
        setCategoryTransitionList(list);
        setCateGoryList(data);
        setSearchParams({ categoryName: "" });
      }
    } finally {
    }
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

  useEffect(() => {
    getList();
    getNameList();
  }, []);

  return (
    <PageContainer>
      <div className="flex justify-between">
        <div style={{ borderRight: "1px solid #E4E4E7" }}>
          <PageTitle title="Settings" isClose={false} />
          <PBJJobsList
            categoryList={categoryList}
            getCategoryName={(categoryName) => {
              setSearchParams({ categoryName });
            }}
            getList={() => {
              getList();
            }}
            getNameList={getNameList}
          />
        </div>
        <div className="ml-9">
          <PageTitle title="PBJ Jobs" isClose={false} />

          <TableSearchForm
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            resetSearch={() => {
              getList({});
            }}
            search={getList}
            // add={() => {
            //   setType("add");
            //   setEditDialogOpen(true);
            //   setEditItem(null);
            // }}
          ></TableSearchForm>

          <div className="h-[calc(100%-200px)] ">
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
          </div>
        </div>
      </div>

      <ConfirmDialog
        btnLoading={delLoading}
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
        }}
        onOk={() => {
          deleteItemHandler(editItem as PbjJobVo);
        }}
      >
        Are you sure you want to delete this item?
      </ConfirmDialog>

      {editDialogOpen && (
        <CreateDia
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          type={type}
          editItem={editItem}
          onClose={() => {
            setEditItem(null);
          }}
          categoryTransitionList={categoryTransitionList}
          getLsit={getList}
          categoryName={searchParams.categoryName}
        ></CreateDia>
      )}
    </PageContainer>
  );
}

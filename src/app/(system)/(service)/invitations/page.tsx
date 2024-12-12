"use client";
import { useSetState } from "ahooks";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { useShallow } from "zustand/react/shallow";

import { getInviteList } from "@/api/invitations";
import { SearchParams } from "@/api/invitations/type";
import { InviteVo } from "@/api/invitations/type";
import { PaginationType } from "@/api/types";
import CustomTable from "@/components/custom/Table";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import useMenuNumStore from "@/store/useMenuNumStore";

import TableSearchForm from "./components/TableSearchForm";
import useReturnTableColumn from "./hooks/tableColumn";
const Page = () => {
  const { isRefreshInvitationPending } = useMenuNumStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const [data, setData] = useState<InviteVo[]>([]);

  const [searchParams, setSearchParams] = useSetState<SearchParams>({});

  const [loading, setLoading] = useImmer<{
    pageLoading: boolean;
    tableLoading: boolean;
  }>({
    pageLoading: false,
    tableLoading: false,
  });

  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });
  const getList = async (params?: SearchParams) => {
    setLoading((draft) => {
      draft.tableLoading = true;
    });
    try {
      const res = await getInviteList(
        params
          ? params
          : ({
              ...searchParams,
              pageNum: pagination.pageNum,
              pageSize: pagination.pageSize,
            } as SearchParams)
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

  const { columns } = useReturnTableColumn({
    getList,
  });

  const handlePageSize = (pageSize: number) => {
    const nowSize = pagination.pageSize * (pagination.pageNum - 1) + 1;
    const pageNum = Math.ceil(nowSize / pageSize);
    setPagination({ ...pagination, pageSize, pageNum: pageNum });
  };

  useEffect(() => {
    getList();
  }, [
    pagination.pageNum,
    pagination.pageSize,
    searchParams,
    isRefreshInvitationPending,
  ]);

  return (
    <PageContainer>
      <PageTitle title="Invitations Pending" isClose={false} />

      <TableSearchForm
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        search={getList}
      ></TableSearchForm>

      <div className="h-[calc(100%-200px)] ">
        <CustomTable
          columns={columns}
          data={data}
          loading={loading.tableLoading}
          adaptive
          pagination={pagination}
          changePageNum={(pageNum) => setPagination({ pageNum })}
          changePageSize={(pageSize) => handlePageSize(pageSize)}
        />
      </div>
    </PageContainer>
  );
};

export default Page;

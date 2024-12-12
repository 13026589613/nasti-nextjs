"use client";
import "./index.sass";

import { useSetState, useUpdateEffect } from "ahooks";
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
  applyTemplate,
  publishErrorConfirmOk,
  publishSchedule,
  unpublishSchedule,
} from "@/api/currentSchedule";
import {
  deleteData,
  getPlanPage,
  getTemplateSelect,
} from "@/api/schedulePlanner";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomTable, { RefProps } from "@/components/custom/Table";
import PageTitle from "@/components/PageTitle";
import { MESSAGE } from "@/constant/message";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalDepartment from "@/hooks/useGlobalDepartmentId";
import useGlobalTime from "@/hooks/useGlobalTime";

import TableSearchForm from "../component/TableSearchForm";
import useReturnTableColumn from "../hooks/tableColumn";
import { SchedulePlannerVo, SearchParams } from "../type";
interface IndexPageProps {
  ref?: React.ReactHTML;
  setIsChild: (value: boolean) => void;
  handleOpenSchedule: (value: SchedulePlannerVo, type: number) => void;
}
const IndexPage = (props: IndexPageProps, ref: any) => {
  const { setIsChild, handleOpenSchedule } = props;

  const { localMoment } = useGlobalTime();

  const tableRef = useRef<RefProps>();
  const [tableData, setTableData] = useState<SchedulePlannerVo[]>([]);

  const { communityId } = useGlobalCommunityId();

  const { departmentIds } = useGlobalDepartment();

  // const [scrollTop, setScrollTop] = useState<number>(0);
  const [currentItem, setCurrentItem] = useState<SchedulePlannerVo>();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Delete dialog open
  const [tableLoading, setTableLoading] = useState(false);
  const [templateList, setTemplateList] = useState([]);

  const hasFirstScroll = useRef<string>("");

  const [searchParams, setSearchParams] = useSetState<SearchParams>({
    communityId: communityId,
    departmentId: "",
    year: localMoment().format("YYYY"),
  });

  const [deleteItem, setDeleteItem] = useState<SchedulePlannerVo | null>(null); // Delete item
  const [publishConfirm, setPublishConfirm] = useSetState({
    visible: false,
    loading: false,
  });
  const [unpublishConfirm, setUnpublishConfirm] = useSetState({
    visible: false,
    loading: false,
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const lastRef = useRef<any>();

  useImperativeHandle(ref, () => {
    return {
      getList,
    };
  });

  const getList = async () => {
    let scrollTop = 0;
    if (scrollAreaRef.current) {
      scrollTop = scrollAreaRef.current.scrollTop;
    }
    setTableLoading(true);

    const res = await getPlanPage({
      communityId: communityId,
      departmentId: departmentIds ? departmentIds.join(",") : "",
      year: searchParams.year || "",
    });

    if (res.code === 200 && res.data) {
      setTimeout(() => {
        setTableLoading(false);
      }, 500);
      const result = res.data.map((item, index: number) => {
        item.key = index;
        return item;
      });
      setTableData((res) => {
        return result;
      });
      clearTimeout(lastRef.current);
      if (hasFirstScroll.current !== communityId + departmentIds.join(",")) {
        lastRef.current = setTimeout(() => {
          result.map((item, index: number) => {
            const { startDate, endDate } = item;
            const isBeforeEnd = localMoment().isSameOrBefore(
              localMoment(endDate, "MM/DD/YYYY"),
              "day"
            );

            const isAfterStart = localMoment().isSameOrAfter(
              localMoment(startDate, "MM/DD/YYYY"),
              "day"
            );
            if (isBeforeEnd && isAfterStart) {
              const current: any = tableRef.current;
              if (!current) return;
              hasFirstScroll.current = communityId + departmentIds.join(",");
              current.scrollToRow(index);
            }
          });
        }, 800);
      } else {
        lastRef.current = setTimeout(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollTop;
          }
        }, 800);
      }
    }
  };

  useUpdateEffect(() => {
    if (departmentIds && departmentIds.length > 0) {
      getList();
      getSelectList();
    }
  }, [communityId, departmentIds]);

  useEffect(() => {
    if (departmentIds && departmentIds.length > 0) {
      getList();
      getSelectList();
    }
  }, [searchParams, departmentIds, communityId]);

  const getSelectList = async () => {
    const res = await getTemplateSelect({
      communityId: communityId,
      departmentId: departmentIds ? departmentIds.join(",") : "",
    });

    if (res.code === 200 && res.data) {
      const result: any = (res.data as any).map(
        (item: { name: string; id: string }) => {
          return {
            label: item.name,
            value: item.id,
          };
        }
      );
      setTemplateList(result);
    }
  };

  const { columns } = useReturnTableColumn({
    searchParams,
    getList,
    setDeleteItem,
    setDeleteDialogOpen,
    templateList,
    handlePublishClick,
    departmentId: departmentIds ? departmentIds.join(",") : "",
    onSelect,
    onCreate,
    handleOpenSchedule,
  });

  function onSelect(value: number, row: any) {
    const arr = tableData.map((item: any) => {
      if (item.key == row.key) {
        item.templateId = value;
      }
      return item;
    });
    setTableData(arr);
  }

  function onCreate(row: SchedulePlannerVo) {
    if (row.templateId) {
      onSubmit(row);
    } else {
      handleOpenSchedule(row, 2);
    }
  }

  const onSubmit = (row: SchedulePlannerVo) => {
    applyTemplate({
      communityId: communityId,
      departmentId: departmentIds ? departmentIds.join(",") : "",
      shiftStartDate: row.startDate,
      shiftEndDate: row.endDate,
      templateId: row.templateId,
      type: 0,
    }).then(({ code, data }) => {
      if (code !== 200) return;
      toast.success(MESSAGE.apply, {
        position: "top-center",
      });
      handleOpenSchedule(row, 3);
      setCurrentItem(row);
      setIsChild(true);
      console.log("object");
    });
  };

  function handlePublishClick(value: any, type: number) {
    setCurrentItem(value);
    if (type == 1) {
      setPublishConfirm({
        visible: true,
      });
    } else {
      setUnpublishConfirm({
        visible: true,
      });
    }
  }

  const publishScheduleFn = async () => {
    setPublishConfirm({
      loading: true,
    });
    try {
      const res = await publishSchedule(currentItem?.id as string);
      if (res.code === 200) {
        const data = res.data;
        if (data.isSuccess) {
          toast.success(MESSAGE.publish, {
            position: "top-center",
          });
          setPublishConfirm({
            visible: false,
            loading: false,
          });
          getList();
        } else {
          setPublishErrorConfirm({
            visible: true,
            loading: false,
            validateMsg: data.validateMsg,
            validateKey: data.validateKey,
          });
        }
      }
    } finally {
      setPublishConfirm({
        loading: false,
      });
    }
  };

  const unpublishScheduleFn = async () => {
    setUnpublishConfirm({
      loading: true,
    });
    try {
      const res = await unpublishSchedule(currentItem?.id as string);
      if (res.code === 200) {
        toast.success(MESSAGE.unpublish, {
          position: "top-center",
        });
        getList();
      }
    } finally {
      setUnpublishConfirm({
        visible: false,
        loading: false,
      });
    }
  };

  const deleteItemHandler = (item: SchedulePlannerVo) => {
    const id = [item.id];
    deleteItemFn(id as string[]);
  };

  const deleteItemFn = async (id: string[]) => {
    const res = await deleteData(id);
    if (res.code === 200) {
      toast.success(MESSAGE.delete, { position: "top-center" });
      getList();
    }
    setDeleteDialogOpen(false);
  };

  function rowClassName(row: SchedulePlannerVo) {
    const { startDate, endDate } = row;
    const isBeforeEnd = localMoment().isSameOrBefore(
      localMoment(endDate, "MM/DD/YYYY"),
      "day"
    );

    const isAfterStart = localMoment().isSameOrAfter(
      localMoment(startDate, "MM/DD/YYYY"),
      "day"
    );
    if (isBeforeEnd && isAfterStart) {
      return "bg-[#4EBBF51A]";
    }
  }

  const [publishErrorConfirm, setPublishErrorConfirm] = useSetState({
    visible: false,
    loading: false,
    validateMsg: [] as string[],
    validateKey: "",
  });

  const publishErrorConfirmOkFn = async () => {
    setPublishErrorConfirm({
      loading: true,
    });
    try {
      const res = await publishErrorConfirmOk(publishErrorConfirm.validateKey);
      if (res.code === 200) {
        toast.success(MESSAGE.publish, {
          position: "top-center",
        });
        setPublishErrorConfirm({
          visible: false,
          loading: false,
          validateMsg: [],
          validateKey: "",
        });
        setPublishConfirm({
          visible: false,
          loading: false,
        });
        getList();
      }
    } finally {
      setPublishErrorConfirm({
        loading: false,
      });
    }
  };

  return (
    <Fragment>
      <PageTitle title="Schedule Planner" isClose={false} />
      <div className="mt-[30px]">
        <TableSearchForm
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          search={getList}
        ></TableSearchForm>
      </div>
      {/* table */}
      <CustomTable
        scrollAreaRef={scrollAreaRef}
        columns={columns}
        data={tableData}
        loading={tableLoading}
        adaptive
        ref={tableRef}
        tableId="scheduleTableId"
        manualPagination={true}
        rowClassName={rowClassName}
        headClass="z-[2]"
      />
      {/* Operate Confirm */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
        }}
        onOk={() => {
          deleteItemHandler(deleteItem as SchedulePlannerVo);
        }}
      >
        Are you sure you want to delete this item?
      </ConfirmDialog>
      {publishConfirm.visible && (
        <ConfirmDialog
          open={publishConfirm.visible}
          btnLoading={publishConfirm.loading}
          width="521px"
          onClose={() => {
            setPublishConfirm({
              visible: false,
            });
          }}
          onOk={() => {
            publishScheduleFn();
          }}
        >
          Are you sure you want to publish this schedule?
        </ConfirmDialog>
      )}

      {unpublishConfirm.visible && (
        <ConfirmDialog
          open={unpublishConfirm.visible}
          btnLoading={unpublishConfirm.loading}
          width="521px"
          onClose={() => {
            setUnpublishConfirm({
              visible: false,
            });
          }}
          onOk={() => {
            unpublishScheduleFn();
          }}
        >
          Are you sure you want to unpublish this schedule?
        </ConfirmDialog>
      )}
      {publishErrorConfirm.visible && (
        <ConfirmDialog
          open={publishErrorConfirm.visible}
          btnLoading={publishErrorConfirm.loading}
          width="560px"
          onClose={() => {
            setPublishErrorConfirm({
              visible: false,
              loading: false,
              validateMsg: [],
              validateKey: "",
            });
            setPublishConfirm({
              visible: false,
              loading: false,
            });
          }}
          onOk={() => {
            publishErrorConfirmOkFn();
          }}
        >
          <div>
            {publishErrorConfirm.validateMsg.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
        </ConfirmDialog>
      )}
    </Fragment>
  );
};
export default forwardRef(IndexPage);

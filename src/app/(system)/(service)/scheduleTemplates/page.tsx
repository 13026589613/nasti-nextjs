"use client";

import { useSetState } from "ahooks";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";

import {
  deleteScheduleTemplate,
  // getScheduleTemplateCount,
  getScheduleTemplateList,
} from "@/api/scheduleTemplates";
import { GetScheduleTemplateListRecord } from "@/api/scheduleTemplates/types";
import AuthProvide from "@/components/custom/Auth";
import Button from "@/components/custom/Button";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import Input from "@/components/custom/Input";
import Table, { CustomColumnDef } from "@/components/custom/Table";
import ActionContainer from "@/components/custom/Table/ActionContainer";
import FormLabel from "@/components/FormComponent/FormLabel";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import { MESSAGE } from "@/constant/message";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalDepartment from "@/hooks/useGlobalDepartmentId";
import useGlobalTime from "@/hooks/useGlobalTime";
import useAuthStore from "@/store/useAuthStore";
import useDepartmentStore from "@/store/useDepartmentStore";

import AddScheduleTemplatesDialog from "./components/AddScheduleTemplatesDialog";
import ApplyTemplateDialog from "./components/applyTemplateDialog";
import { DialogInfoType } from "./types";

export default function ScheduleTemplates() {
  const { zoneAbbr } = useGlobalTime();
  const router = useRouter();
  const { permission } = useAuthStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const { departmentIds } = useGlobalDepartment();

  const { communityId, companyId } = useGlobalCommunityId();

  const [loadings, setLoadings] = useSetState({
    tableLoading: true,
  });

  const [applyTemplate, setApplyTemplate] = useSetState({
    open: false,
  });

  const [queryForm, setQueryForm] = useSetState({
    name: "",
    companyId: communityId,
    communityId: companyId,
    departmentId: departmentIds.join(","),
    pageNum: 1,
    pageSize: 15,
  });

  const [tableTotal, setTableTotal] = useState(0);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCheckOpen, setDeleteCheckOpen] = useState(false);
  const [deleteItem, setDeleteItem] =
    useState<GetScheduleTemplateListRecord | null>(null);

  const [currentItem, setCurrentItem] = useState<any>();

  const deleteTemplateFn = async () => {
    if (!deleteItem) return;
    const res = await deleteScheduleTemplate(deleteItem.id);
    if (res.code === 200) {
      toast.success(MESSAGE.delete, {
        position: "top-center",
      });
      loadGetScheduleTemplateList();
      setDeleteDialogOpen(false);
      setDeleteCheckOpen(false);
    }
  };

  const columns: CustomColumnDef<GetScheduleTemplateListRecord>[] = [
    {
      accessorKey: "name",
      header: ({}) => {
        return <div>Template Name</div>;
      },
      cell: ({ row }) => {
        return <div>{row.getValue("name")}</div>;
      },
    },
    {
      accessorKey: "author",
      header: ({}) => {
        return <div>Author</div>;
      },
      cell: ({ row }) => {
        return <div>{row.getValue("author")}</div>;
      },
    },
    {
      accessorKey: "lastUserDate",
      header: ({}) => {
        return <div>Last Used Date</div>;
      },
      cell: ({ row }) => {
        const { lastUserDate } = row.original;
        let str = lastUserDate + ` (${zoneAbbr})`;

        if (!lastUserDate) {
          str = "";
        }
        return <div>{str}</div>;
      },
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell(props) {
        return (
          <ActionContainer
            actions={[
              {
                name: "view",
                content: "View",
                isHide: permission.includes("TEMPLATE_MANAGEMENT_EDIT"),
                onClick: () => {
                  const templateId = props.row.original.id;
                  const departmentId = props.row.original.departmentId;
                  router.push(
                    `/scheduleTemplates/edit?type=view&templateId=${templateId}&departmentId=${departmentId}`
                  );
                  useDepartmentStore
                    .getState()
                    .setDepartment([departmentId], "/scheduleTemplates/edit");
                },
              },
              {
                name: "edit",
                content: "Edit",
                isHide: !permission.includes("TEMPLATE_MANAGEMENT_EDIT"),
                onClick: () => {
                  const templateId = props.row.original.id;
                  const departmentId = props.row.original.departmentId;
                  router.push(
                    `/scheduleTemplates/edit?type=edit&templateId=${templateId}&departmentId=${departmentId}`
                  );
                  useDepartmentStore
                    .getState()
                    .setDepartment([departmentId], "/scheduleTemplates/edit");
                },
              },
              {
                name: "applyTemplate",
                content: "Apply Template",
                isHide: !permission.includes("TEMPLATE_MANAGEMENT_APPLY"),
                onClick: () => {
                  const existShift = props.row.original.existShift;
                  if (!existShift) {
                    toast.error(
                      "Template shift does not exist and cannot be applied!",
                      {
                        position: "top-center",
                      }
                    );
                    return;
                  }
                  setApplyTemplate({
                    open: true,
                  });
                  setCurrentItem(props.row.original);
                },
              },
              {
                name: "copy",
                content: "Duplicate Template",
                isHide: !permission.includes("TEMPLATE_MANAGEMENT_COPY"),

                onClick: () => {
                  setAddDialogInfo({
                    open: true,
                    copyItem: props.row.original,
                  });
                },
              },
              {
                name: "delete",
                content: "Delete",
                isHide: !permission.includes("TEMPLATE_MANAGEMENT_DELETE"),
                onClick: () => {
                  setDeleteDialogOpen(true);
                  setDeleteItem(props.row.original);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  const [dataList, setDataList] = useState<GetScheduleTemplateListRecord[]>([]);

  // Add anti-shake function for list interface requests
  const loadGetScheduleTemplateList = debounce(() => {
    setLoadings({ tableLoading: true });
    getScheduleTemplateList(queryForm)
      .then(({ code, data: { records, total } }) => {
        if (code !== 200) return;

        setTableTotal(total);
        setDataList(records);
      })
      .finally(() => {
        setLoadings({ tableLoading: false });
        // Prevent table loading from flickering
        setTimeout(() => {
          setLoadings({ tableLoading: false });
        }, 300);
      });
  }, 300);

  useEffect(() => {
    if (queryForm.departmentId) {
      loadGetScheduleTemplateList();
    }
    return () => loadGetScheduleTemplateList.cancel();
  }, [queryForm]);

  const handleInput = (v: React.ChangeEvent<HTMLInputElement>) => {
    setQueryForm({
      name: v.target.value,
      pageNum: 1,
    });
  };

  const [addDialogInfo, setAddDialogInfo] = useSetState<DialogInfoType>({
    open: false,
    copyItem: null,
  });

  useEffect(() => {
    if (companyId) {
      setQueryForm({
        ...queryForm,
        companyId: companyId,
        communityId: communityId,
        departmentId: departmentIds.join(","),
      });
    }
  }, [communityId, companyId, departmentIds]);

  useEffect(() => {
    if (queryForm.companyId) {
      loadGetScheduleTemplateList();
    }
  }, [queryForm]);

  return (
    <PageContainer className="min-w-[1200px]">
      <PageTitle
        className="mb-[18px]"
        title="Schedule Templates"
        isClose={false}
      />
      <div className="mb-[30px] flex gap-5">
        <FormLabel className="w-[376px]" label="Template Name">
          <Input
            placeholder="Search by Template Name"
            value={queryForm.name}
            onChange={handleInput}
            isClearable
            suffix="SearchIcon"
          />
        </FormLabel>

        <AuthProvide permissionName="TEMPLATE_MANAGEMENT_ADD">
          <FormLabel className="ml-auto">
            <Button
              icon="add"
              onClick={() =>
                setAddDialogInfo({
                  open: true,
                  copyItem: null,
                })
              }
            >
              Add
            </Button>
          </FormLabel>
        </AuthProvide>
      </div>

      <Table
        columns={columns as CustomColumnDef<unknown>[]}
        data={dataList}
        adaptive
        loading={loadings.tableLoading}
        pagination={{
          pageNum: queryForm.pageNum,
          pageSize: queryForm.pageSize,
          total: tableTotal,
        }}
        changePageNum={(pageNum) => setQueryForm({ pageNum })}
        changePageSize={(pageSize) => {
          const nowSize = queryForm.pageSize * (queryForm.pageNum - 1) + 1;

          const pageNum = Math.ceil(nowSize / pageSize);

          setQueryForm({ ...queryForm, pageSize, pageNum: pageNum });
        }}
      />

      {/* dialog */}
      {addDialogInfo.open && (
        <AddScheduleTemplatesDialog
          communityId={queryForm.communityId}
          departmentId={addDialogInfo.copyItem?.departmentId || ""}
          copyItem={addDialogInfo.copyItem}
          onClose={() =>
            setAddDialogInfo({
              open: false,
            })
          }
          onSuccess={() => loadGetScheduleTemplateList()}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
        }}
        onOk={() => {
          setDeleteDialogOpen(false);
          deleteTemplateFn();
        }}
      >
        Are you sure you want to delete this schedule template?
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteCheckOpen}
        onClose={() => {
          setDeleteCheckOpen(false);
        }}
        onOk={() => {
          setDeleteCheckOpen(false);
          deleteTemplateFn();
        }}
      >
        This schedule template has at least one shift. Are you sure you want to
        delete this schedule template?
      </ConfirmDialog>
      {/* Apply Template */}
      {applyTemplate.open && (
        <ApplyTemplateDialog
          communityId={queryForm.communityId}
          departmentId={currentItem.departmentId}
          currentItem={currentItem}
          onClose={() =>
            setApplyTemplate({
              open: false,
            })
          }
          onSuccess={() => loadGetScheduleTemplateList()}
        />
      )}
    </PageContainer>
  );
}

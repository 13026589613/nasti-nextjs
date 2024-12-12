"use client";

import AuthProvide from "@/components/custom/Auth";
import Select from "@/components/custom/Select";
import { CustomColumnDef } from "@/components/custom/Table";
// import { useShallow } from "zustand/react/shallow";
// import AuthProvide from "@/components/custom/Auth";
// import Select from "@/components/custom/Select";
import Tooltip from "@/components/custom/Tooltip";
import useGlobalTime from "@/hooks/useGlobalTime";
// import useAuthStore from "@/store/useAuthStore";
import CheckIcon from "~/icons/CheckIcon.svg";
import Delete from "~/icons/DeleteIcon.svg";
import DisablePublishIcon from "~/icons/DisablePublishIcon.svg";
import Edit from "~/icons/EditIcon.svg";
import PublishIcon from "~/icons/PublishIcon.svg";

import { SchedulePlannerVo, SearchParams } from "../type";
interface TableColumnProps {
  searchParams: SearchParams;
  setDeleteDialogOpen: (value: boolean) => void;
  setDeleteItem: (value: SchedulePlannerVo | null) => void;
  getList: any;
  templateList: any;
  handlePublishClick: (arg1: any, type: number) => void;
  departmentId: string;
  onSelect: (arg1: number, agr2: SchedulePlannerVo) => void;
  onCreate: (value: SchedulePlannerVo) => void;
  handleOpenSchedule: (value: SchedulePlannerVo, type: number) => void;
}

const useReturnTableColumn = (props: TableColumnProps) => {
  const {
    setDeleteItem,
    setDeleteDialogOpen,
    templateList,
    handlePublishClick,
    onSelect,
    onCreate,
    handleOpenSchedule,
  } = props;

  const { localMoment, zoneAbbr } = useGlobalTime();

  // const { permission } = useAuthStore(
  //   useShallow((state: any) => ({
  //     ...state,
  //   }))
  // );
  let columns: CustomColumnDef<SchedulePlannerVo>[] = [
    {
      accessorKey: "weekOfYear",
      header: ({ column }) => {
        return (
          <span className="flex items-center cursor-pointer">Week of Year</span>
        );
      },
      cell: ({ row }) => (
        <div>
          <span className="mr-[5px]">Week</span>
          {row.getValue("weekOfYear")}
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => {
        return (
          <span className="flex items-center cursor-pointer">Start Date</span>
        );
      },
      cell: ({ row }) => <div>{row.getValue("startDate")}</div>,
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => {
        return (
          <span className="flex items-center cursor-pointer">End Date</span>
        );
      },
      cell: ({ row }) => <span>{row.getValue("endDate")}</span>,
    },
    {
      accessorKey: "templateName",
      width: "20%",
      header: ({ column }) => {
        return (
          <span className="flex items-center cursor-pointer">
            Schedule Template
          </span>
        );
      },
      cell: ({ row }) => {
        const { endDate } = row.original;
        let isHideSelect = false;
        if (localMoment(endDate, "MM/DD/YYYY").isBefore(localMoment())) {
          isHideSelect = true;
        }
        return (
          <div>
            {!row.original.isCreate ? (
              <div className="">
                {!isHideSelect && (
                  <AuthProvide permissionName={"SCHEDULE_MANAGEMENT_ADD"}>
                    <Select
                      isClearable
                      options={templateList}
                      placeholder="Please select"
                      value={row.original.templateId}
                      onChange={(value) => {
                        onSelect(value, row.original);
                      }}
                      menuWrapperClass="z-[1]"
                    />
                  </AuthProvide>
                )}
              </div>
            ) : (
              <span className="h-[38px] flex items-center">
                {row.getValue("templateName")}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <div className="flex items-center cursor-pointer">Created Date</div>
        );
      },
      cell: ({ row }) => {
        const { endDate, isCreate, templateId } = row.original;
        let isHideSelect = false;
        if (localMoment(endDate, "MM/DD/YYYY").isBefore(localMoment())) {
          isHideSelect = true;
        }
        return (
          <div>
            {isCreate ? (
              <div>{`${localMoment(row.getValue("createdAt")).format(
                "MM/DD/YYYY"
              )} (${zoneAbbr})`}</div>
            ) : (
              <>
                <AuthProvide permissionName={"SCHEDULE_MANAGEMENT_ADD"}>
                  {!isHideSelect && (
                    <span
                      className="text-[#9747FFC7] font-[390] text-[16px] cursor-pointer underline"
                      onClick={() => {
                        onCreate(row.original);
                      }}
                    >
                      {templateId
                        ? "Apply Template to Schedule"
                        : "Create Schedule"}
                    </span>
                  )}
                </AuthProvide>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isPublished",
      header: ({ column }) => {
        return <div className="flex items-center cursor-pointer">Status</div>;
      },
      cell: ({ row }) => (
        <>
          {row.getValue("isPublished") === null ? (
            ""
          ) : (
            <span
              className={`inline-block h-[28px] text-center leading-[28px] ${
                !row.getValue("isPublished")
                  ? "bg-[#46DB7A1A]"
                  : "bg-[#F55F4E1A]"
              } rounded-[14px] text-[#919FB4] font-[390] text-[16px] px-[15px]`}
            >
              {!row.getValue("isPublished") ? "Draft" : "Published"}
            </span>
          )}
        </>
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="flex items-center cursor-pointer">Action</div>
      ),
      enableHiding: false,
      cell: ({ row }) => {
        const { endDate, startDate, isCreate, isPublished } = row.original;
        let isCurrentWeek = false;
        const startOfWeek = localMoment().startOf("week");
        const isBeforeCurrentWeek = startOfWeek.isAfter(
          localMoment(startDate, "MM/DD/YYYY"),
          "day"
        );

        if (
          localMoment(endDate, "MM/DD/YYYY").isSameOrAfter(
            localMoment(),
            "day"
          ) &&
          localMoment(startDate, "MM/DD/YYYY").isSameOrBefore(
            localMoment(),
            "day"
          )
        ) {
          isCurrentWeek = true;
        }

        return (
          <div className="flex gap-4">
            {isCreate && (
              <>
                <AuthProvide
                  invert
                  authenticate={!isBeforeCurrentWeek}
                  permissionName={"SCHEDULE_MANAGEMENT_EDIT"}
                >
                  <Tooltip content="View">
                    <CheckIcon
                      className="cursor-pointer"
                      width={16}
                      color={"#68B7B0"}
                      onClick={() => {
                        handleOpenSchedule(row.original, 1);
                      }}
                    ></CheckIcon>
                  </Tooltip>
                </AuthProvide>

                {!isBeforeCurrentWeek ? (
                  <>
                    <AuthProvide permissionName={"SCHEDULE_MANAGEMENT_EDIT"}>
                      <Tooltip content="Edit">
                        <Edit
                          className="cursor-pointer"
                          width={16}
                          color={"#EB1DB2"}
                          onClick={() => {
                            handleOpenSchedule(row.original, 2);
                          }}
                        ></Edit>
                      </Tooltip>
                    </AuthProvide>

                    {isPublished ? (
                      <>
                        {!isCurrentWeek && (
                          <AuthProvide
                            permissionName={"SCHEDULE_MANAGEMENT_PUBLISH"}
                          >
                            <Tooltip content="Unpublish">
                              <DisablePublishIcon
                                className="cursor-pointer"
                                width={16}
                                color={"#F55F4E"}
                                onClick={() => {
                                  handlePublishClick(row.original, 2);
                                }}
                              ></DisablePublishIcon>
                            </Tooltip>
                          </AuthProvide>
                        )}
                      </>
                    ) : (
                      <AuthProvide
                        permissionName={"SCHEDULE_MANAGEMENT_PUBLISH"}
                      >
                        <Tooltip content="Publish">
                          <PublishIcon
                            className="cursor-pointer"
                            width={16}
                            color={"#87DEA5"}
                            onClick={() => {
                              handlePublishClick(row.original, 1);
                            }}
                          ></PublishIcon>
                        </Tooltip>
                      </AuthProvide>
                    )}
                    {isCreate && !isCurrentWeek && (
                      <AuthProvide
                        permissionName={"SCHEDULE_MANAGEMENT_DELETE"}
                      >
                        <Tooltip content="Delete">
                          <Delete
                            className="cursor-pointer"
                            width={16}
                            color={"#13227A"}
                            onClick={() => {
                              setDeleteItem(row.original);
                              setDeleteDialogOpen(true);
                            }}
                          ></Delete>
                        </Tooltip>
                      </AuthProvide>
                    )}
                  </>
                ) : (
                  ""
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  return {
    columns,
  };
};
export default useReturnTableColumn;

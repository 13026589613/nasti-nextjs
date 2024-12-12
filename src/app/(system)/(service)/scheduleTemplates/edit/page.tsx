"use client";

import { DragEndEvent } from "@dnd-kit/core";
import { useSetState } from "ahooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useImmer } from "use-immer";
import { useShallow } from "zustand/react/shallow";

import { locationListSearch } from "@/api/location";
import {
  getScheduleTemplateShiftList,
  getScheduleTemplateShiftRoleList,
  scheduleTemplateShiftDelete,
  scheduleTemplateShiftEdit,
} from "@/api/scheduleTemplates";
import {
  ScheduleTemplateShiftCreateParams,
  ShiftTime,
  TemplateShift,
  TemplateShiftEmployee,
  TemplateShiftRole,
  TemplateShiftType,
} from "@/api/scheduleTemplates/types";
import { getUserWorkerListRoleAll } from "@/api/user";
import { workerRoleList } from "@/api/workerRole";
import AuthProvide from "@/components/custom/Auth";
import Button from "@/components/custom/Button";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import Select, { OptionType } from "@/components/custom/Select";
import { FormLabel } from "@/components/FormComponent";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import ViewRoleTags from "@/components/schedules/components/ViewRoleTags";
import { onDragStopCallback } from "@/components/schedules/templateSchedule/package/shiftTimeLine/types";
import { formatDate } from "@/components/schedules/utils";
import TabsButton from "@/components/TabsButton";
import { MESSAGE } from "@/constant/message";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useDepartmentStore from "@/store/useDepartmentStore";
import sortListByKey from "@/utils/sortByKey";

import AddShiftDialog from "./components/AddShiftDialog";
import BulkEditDialog from "./components/BulkEditDialog";
import ScheduleTemplateInfo from "./components/ScheduleTemplateInfo";
import ScheduleTemplateViews from "./components/ScheduleTemplateViews";
import { ViewData } from "./components/types";

const Page = () => {
  const router = useRouter();

  const searchParams = useSearchParams();

  const isEdit = (searchParams.get("type") as string) === "edit";
  const templateId = searchParams.get("templateId") as string;
  const departmentId = searchParams.get("departmentId") as string;

  const { communityId } = useGlobalCommunityId();

  const [queryViewForm, setQueryViewForm] = useSetState<{
    type: TemplateShiftType;
    locationId: string;
    workerRoleId: string;
    userId: string;
  }>({
    type: "role",
    locationId: "",
    workerRoleId: "",
    userId: "",
  });

  const [shiftTimeViewData, setShiftTimeViewData] = useImmer<
    ViewData<ShiftTime>
  >({
    startOfWeek: "",
    scheduleTemplateShiftVOs: [],
  });

  const [roleViewData, setRoleViewData] = useImmer<ViewData<TemplateShiftRole>>(
    {
      startOfWeek: "",
      scheduleTemplateShiftVOs: [],
    }
  );

  const [employeeViewData, setEmployeeViewData] = useImmer<
    ViewData<TemplateShiftEmployee>
  >({
    startOfWeek: "",
    scheduleTemplateShiftVOs: [],
  });

  const updateShift = (shift: TemplateShift) => {
    const { dayOfWeek, userId, ...rest } = shift;
    let params: ScheduleTemplateShiftCreateParams = {
      dayOfWeek: [dayOfWeek],
      userId,
      ...rest,
      locationIds: shift.locationRefVOs?.map((item) => item.locationId),
    };
    if (userId === "00000000-0000-0000-0000-000000000000") {
      params.userId = undefined;
    }
    scheduleTemplateShiftEdit(params)
      .then(({ code }) => {
        if (code !== 200) return;
        toast.success(MESSAGE.edit, {
          position: "top-center",
        });
      })
      .finally(() => {
        // Follow up to decide if you want to rehash the data
        loadGetScheduleTemplateShiftList();
      });
  };

  // handle department view shift update
  const handleRoleViewDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    const activeType = active.data.current?.type;
    const overType = over?.data.current?.type;

    const activeData = active.data.current;

    const activeShift = activeData?.shift;

    if (!activeShift) {
      return;
    }

    // Again it's all shift logic
    if (activeType === "item" && overType === "item" && active && over) {
      const overShift = over.data.current?.shift as TemplateShift;

      if (!overShift) return;

      if (overShift.shiftId === activeShift.shiftId) {
        return;
      }

      const { workerRoleId, id } = active.data.current as TemplateShift;

      const { dayOfWeek } = over.data.current?.shift as TemplateShift;

      setRoleViewData((draft) => {
        const role = draft?.scheduleTemplateShiftVOs?.find(
          (role) => role.roleId === workerRoleId
        );

        const shift = role?.shifts.find((shift) => shift.id === id);

        if (!shift) return;

        // over.id is the day of the week
        if (shift.dayOfWeek !== dayOfWeek) {
          shift.dayOfWeek = dayOfWeek;
        }
      });

      if (activeShift.dayOfWeek !== dayOfWeek) {
        const submitShiftItem = {
          ...activeShift,
          dayOfWeek,
        } as TemplateShift;

        updateShift(submitShiftItem);
      }
    }

    // One is the container, the other is the logic of the shift.
    if (
      activeType === "item" &&
      overType === "container" &&
      active &&
      over &&
      active.id !== over.id
    ) {
      const activeShift = active.data.current?.shift as TemplateShift;

      const containerDayOfWeek = Number(over.id);

      if (!activeShift) return;

      const { workerRoleId, id } = activeShift;

      setRoleViewData((draft) => {
        const role = draft?.scheduleTemplateShiftVOs?.find(
          (role) => role.roleId === workerRoleId
        );

        const shift = role?.shifts.find((shift) => shift.id === id);

        if (!shift) return;

        // over.id is the day of the week
        if (shift.dayOfWeek !== containerDayOfWeek) {
          shift.dayOfWeek = containerDayOfWeek;
        }
      });

      if (activeShift.dayOfWeek !== containerDayOfWeek) {
        const submitShiftItem = {
          ...activeShift,
          dayOfWeek: containerDayOfWeek,
        } as TemplateShift;

        updateShift(submitShiftItem);
      }
    }
  };

  // handle employee view shift update
  const handleEmployeeViewDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    const activeType = active.data.current?.type;
    const overType = over?.data.current?.type;

    // Again it's all shift logic
    if (
      activeType === "item" &&
      overType === "item" &&
      active &&
      over &&
      active.id !== over.id
    ) {
      const activeShift = active.data.current?.shift as TemplateShift;
      const overShift = over.data.current?.shift as TemplateShift;

      if (!activeShift || !overShift) return;

      const { userId, id } = activeShift;

      const { dayOfWeek } = overShift;

      setEmployeeViewData((draft) => {
        const user = draft.scheduleTemplateShiftVOs.find(
          (department) => department.userId === userId
        );

        if (!user) return;

        const shift = user?.shifts.find((shift) => shift.id === id);

        if (!shift) return;

        // over.id is the day of the week
        if (shift.dayOfWeek !== dayOfWeek) {
          shift.dayOfWeek = dayOfWeek;
        }
      });

      if (activeShift.dayOfWeek !== dayOfWeek) {
        const submitShiftItem = {
          ...activeShift,
          dayOfWeek,
        } as TemplateShift;

        updateShift(submitShiftItem);
      }
    }

    // One is the container, the other is the logic of the shift.
    if (
      activeType === "item" &&
      overType === "container" &&
      active &&
      over &&
      active.id !== over.id
    ) {
      const activeShift = active.data.current?.shift as TemplateShift;

      const containerDayOfWeek = Number(over.id);

      if (!activeShift) return;

      const { userId, id } = activeShift;

      setEmployeeViewData((draft) => {
        const user = draft.scheduleTemplateShiftVOs.find(
          (department) => department.userId === userId
        );

        if (!user) return;

        const shift = user?.shifts.find((shift) => shift.id === id);

        if (!shift) return;

        // over.id is the day of the week
        if (shift.dayOfWeek !== containerDayOfWeek) {
          shift.dayOfWeek = containerDayOfWeek;
        }
      });

      const submitShiftItem = {
        ...activeShift,
        dayOfWeek: containerDayOfWeek,
      } as TemplateShift;

      updateShift(submitShiftItem);
    }
  };

  const handleShiftTimeDragStop: onDragStopCallback = (processData, shift) => {
    const { newStartTime, newEndTime } = processData;
    const { dayOfWeek, id } = shift;

    const newStartTimeDate = formatDate(
      newStartTime,
      "hh:mm A",
      "MM/DD/YYYY HH:mm"
    );
    const newEndTimeDate = formatDate(
      newEndTime,
      "hh:mm A",
      "MM/DD/YYYY HH:mm"
    );

    setShiftTimeViewData((draft) => {
      const shiftTime = draft.scheduleTemplateShiftVOs.find(
        (value) => value.dayOfWeek === dayOfWeek
      );

      if (!shiftTime) return;

      const shiftItem = shiftTime?.shifts.find((shift) => shift.id === id);

      if (!shiftItem) return;

      shiftItem.startTime = newStartTimeDate;
      shiftItem.endTime = newEndTimeDate;
    });

    const submitShiftItem = {
      ...shift,
      startTime: newStartTimeDate,
      endTime: newEndTimeDate,
    };
    updateShift(submitShiftItem);
  };

  const handleShiftTimeResizeStop: onDragStopCallback = (
    processData,
    shift
  ) => {
    const { newStartTime, newEndTime } = processData;
    const { dayOfWeek, id } = shift;

    const newStartTimeDate = formatDate(
      newStartTime,
      "hh:mm A",
      "MM/DD/YYYY HH:mm"
    );
    const newEndTimeDate = formatDate(
      newEndTime,
      "hh:mm A",
      "MM/DD/YYYY HH:mm"
    );

    setShiftTimeViewData((draft) => {
      const shiftTime = draft.scheduleTemplateShiftVOs.find(
        (value) => value.dayOfWeek === dayOfWeek
      );

      if (!shiftTime) return;

      const shiftItem = shiftTime?.shifts.find((shift) => shift.id === id);

      if (!shiftItem) return;

      shiftItem.startTime = newStartTimeDate;
      shiftItem.endTime = newEndTimeDate;
    });

    const submitShiftItem = {
      ...shift,
      startTime: newStartTimeDate,
      endTime: newEndTimeDate,
    };
    updateShift(submitShiftItem);
  };

  // get views data
  const loadGetScheduleTemplateShiftList = useCallback(async () => {
    let notAssigned = false;
    const option = selectsInfo.employeeOptions.find(
      (item) => item.value === queryViewForm.userId
    );
    if (option) {
      if (option.__isNew__) {
        notAssigned = true;
      }
    }
    switch (queryViewForm.type) {
      case "shiftTime":
        const shiftTimeResult = await getScheduleTemplateShiftList<"shiftTime">(
          {
            templateId,
            communityId: communityId as string,
            departmentId,
            notAssigned,
            ...queryViewForm,
            userId: notAssigned ? null : queryViewForm.userId,
          }
        );

        if (shiftTimeResult.code !== 200) return;

        setShiftTimeViewData(shiftTimeResult.data);
        break;
      case "role":
        const departmentResult = await getScheduleTemplateShiftList<"role">({
          templateId,
          communityId: communityId as string,
          departmentId,
          notAssigned,
          ...queryViewForm,
          userId: notAssigned ? null : queryViewForm.userId,
        });

        if (departmentResult.code !== 200) return;

        setRoleViewData(departmentResult.data);
        break;
      case "employee":
        const employeeResult = await getScheduleTemplateShiftList<"employee">({
          templateId,
          communityId: communityId as string,
          departmentId,
          notAssigned,
          ...queryViewForm,
          userId: notAssigned ? null : queryViewForm.userId,
        });

        if (employeeResult.code !== 200) return;

        setEmployeeViewData(employeeResult.data);
        break;
    }
  }, [queryViewForm]);

  useEffect(() => {
    loadGetScheduleTemplateShiftList();
  }, [queryViewForm]);

  const [selectsInfo, setSelectsInfo] = useSetState({
    locationLoading: true,
    locationOptions: [] as OptionType[],

    roleLoading: true,
    roleOptions: [] as OptionType[],

    employeeLoading: true,
    employeeOptions: [] as OptionType[],
  });

  const loadGetLocationList = () => {
    locationListSearch({
      communityId: communityId as string,
      isEnabled: true,
      departmentIds: departmentId,
    })
      .then(({ code, data }) => {
        if (code !== 200) return;

        setSelectsInfo({
          locationOptions: data.map((item) => ({
            label: item.name,
            value: item.id,
          })),
        });
      })
      .finally(() =>
        setSelectsInfo({
          locationLoading: false,
        })
      );
  };

  const loadGetRoleList = () => {
    workerRoleList(communityId as string, true, departmentId)
      .then(({ code, data }) => {
        if (code !== 200) return;

        setSelectsInfo({
          roleOptions: data.map((item) => ({
            label: item.name,
            value: item.id,
          })),
        });
      })
      .finally(() =>
        setSelectsInfo({
          roleLoading: false,
        })
      );
  };

  const { department, getDepartmentIds } = useDepartmentStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const pathname = usePathname();

  const loadGetUserWorkerList = () => {
    const roleId = queryViewForm.workerRoleId;
    let params: any = {
      communityId: communityId as string,
      departmentIds: getDepartmentIds(pathname).join(",")
        ? getDepartmentIds(pathname).join(",")
        : null,
      roleId,
    };

    getUserWorkerListRoleAll(params)
      .then(({ code, data }) => {
        if (code !== 200) return;

        if (data)
          setSelectsInfo({
            employeeOptions: [
              {
                label: "Not Assigned",
                value: "notAssigned",
                __isNew__: true,
              },
              ...sortListByKey(
                data.map((item) => ({
                  label: `${item.firstName} ${item.lastName}`,
                  value: item.userId,
                }))
              ),
            ],
          });
      })
      .finally(() =>
        setSelectsInfo({
          employeeLoading: false,
        })
      );
  };

  useEffect(() => {
    loadGetLocationList();
    loadGetRoleList();
    loadGetUserWorkerList();
  }, [department, communityId]);
  useEffect(() => {
    loadGetUserWorkerList();
  }, [queryViewForm.workerRoleId]);
  const [roleList, setRoleList] = useState<{ color: string; name: string }[]>(
    []
  );

  const loadGetScheduleTemplateShiftRoleList = () => {
    getScheduleTemplateShiftRoleList({
      templateId,
      communityId: communityId as string,
      departmentId,
    }).then(({ code, data }) => {
      if (code !== 200) return;

      setRoleList(data);
    });
  };

  useEffect(() => {
    loadGetLocationList();
    loadGetRoleList();
    loadGetUserWorkerList();

    loadGetScheduleTemplateShiftRoleList();
  }, [communityId]);

  const defaultAddShiftDialogInfo = {
    open: false,
    shiftId: "",
    dayOfWeek: [],
    workerRoleId: "",
    userId: "",
  };

  const [AddShiftDialogInfo, setAddShiftDialogInfo] = useSetState<{
    open: boolean;
    shiftId: string;
    dayOfWeek: number[];
    workerRoleId?: string;
    userId?: string;
  }>({
    ...defaultAddShiftDialogInfo,
  });

  const handleShiftItemClick = (shift: TemplateShift) => {
    const { shiftId, dayOfWeek, workerRoleId, userId } = shift;

    setAddShiftDialogInfo({
      open: true,
      shiftId: shiftId,
      dayOfWeek: [dayOfWeek],
      workerRoleId,
      userId,
    });
  };

  const [selectShiftIds, setSelectShiftIds] = useState<string[]>([]);
  const [selectShift, setSelectShift] = useState<TemplateShift[]>([]);

  const [isShowBulkDeleteDialog, setIsShowBulkDeleteDialog] = useState(false);

  const handleBulkDeleteShift = () => {
    scheduleTemplateShiftDelete(selectShiftIds.join(",")).then(() => {
      toast.success(MESSAGE.delete, {
        position: "top-center",
      });

      setSelectShiftIds([]);

      loadGetScheduleTemplateShiftList();

      loadGetScheduleTemplateShiftRoleList();

      setIsShowBulkDeleteDialog(false);
    });
  };

  const [isShowBulkEditDialog, setIsShowBulkEditDialog] = useState(false);

  return (
    <PageContainer className="min-w-[1400px]">
      <PageTitle
        className="mb-[20px]"
        title={isEdit ? "Edit Schedule Template" : "View Schedule Template"}
        rightClick={() => {
          router.replace("/scheduleTemplates");
        }}
      />

      <ScheduleTemplateInfo templateId={templateId} isEdit={isEdit} />

      <div className="flex justify-between">
        <TabsButton
          items={[
            { key: "shiftTime", name: "Shift Time" },
            { key: "role", name: "Role" },
            { key: "employee", name: "Employee" },
          ]}
          currentKey={queryViewForm.type}
          onChange={(key) => {
            window.scrollTo(0, 0);
            setQueryViewForm({
              type: key as TemplateShiftType,
            });
          }}
        />

        {isEdit && (
          <div>
            <AuthProvide permissionName={"TEMPLATE_MANAGEMENT_ADD"}>
              <Button
                icon="addShift"
                className="bg-[#6C5AD7] hover:bg-[#6C5AD7]"
                onClick={() => {
                  setAddShiftDialogInfo({
                    ...defaultAddShiftDialogInfo,
                    open: true,
                  });
                }}
              >
                Add Shift
              </Button>
            </AuthProvide>

            <AuthProvide permissionName={"TEMPLATE_MANAGEMENT_EDIT"}>
              <Button
                icon="bulkEditIcon"
                className="bg-[#8FCC41] hover:bg-[#8FCC41] ml-[30px]"
                onClick={() => {
                  if (selectShiftIds.length === 0) {
                    toast.warning("Please select the shifts to edit. ", {
                      position: "top-center",
                    });
                    return;
                  }

                  setIsShowBulkEditDialog(true);
                }}
              >
                Bulk Edit
              </Button>
            </AuthProvide>

            <AuthProvide permissionName={"TEMPLATE_MANAGEMENT_DELETE"}>
              <Button
                icon="bulkDelete"
                className="bg-[#EF4444] hover:bg-[#EF4444] ml-[30px]"
                onClick={() => {
                  if (selectShiftIds.length === 0) {
                    toast.warning("Please select the shifts to delete.", {
                      position: "top-center",
                    });
                    return;
                  }

                  setIsShowBulkDeleteDialog(true);
                }}
              >
                Bulk Delete
              </Button>
            </AuthProvide>
          </div>
        )}
      </div>

      <div className="mt-[20px] flex">
        <FormLabel label="Location" className="w-[376px] mr-[20px]">
          <Select
            isClearable
            isLoading={selectsInfo.locationLoading}
            options={selectsInfo.locationOptions}
            value={queryViewForm.locationId}
            onChange={(value) => {
              setQueryViewForm({
                locationId: value,
              });
            }}
            placeholder="Location"
          />
        </FormLabel>

        <FormLabel label="Role" className="w-[376px] mr-[20px]">
          <Select
            isClearable
            isLoading={selectsInfo.roleLoading}
            options={selectsInfo.roleOptions}
            value={queryViewForm.workerRoleId}
            onChange={(value) => {
              setQueryViewForm({
                workerRoleId: value,
              });
            }}
            placeholder="Role"
          />
        </FormLabel>

        <FormLabel label="Employee" className="w-[376px]">
          <Select
            isClearable
            isLoading={selectsInfo.employeeLoading}
            options={selectsInfo.employeeOptions}
            value={queryViewForm.userId}
            onChange={(value) => {
              setQueryViewForm({
                userId: value,
              });
            }}
            placeholder="Employee"
          />
        </FormLabel>
      </div>

      <ViewRoleTags roleList={roleList} />

      <ScheduleTemplateViews
        selectShiftIds={selectShiftIds}
        onSelectShiftId={(shift) => {
          // Select the shift
          setSelectShiftIds((prev) => {
            if (prev.includes(shift.shiftId)) {
              return prev.filter((item) => item !== shift.shiftId);
            } else {
              return [...prev, shift.shiftId];
            }
          });

          setSelectShift((prev) => {
            const index = prev.findIndex(
              (item) => item.shiftId === shift.shiftId
            );
            if (index === -1) {
              return [...prev, shift];
            } else {
              return prev.filter((item) => item.shiftId !== shift.shiftId);
            }
          });
        }}
        enabled={isEdit}
        templateId={templateId}
        currentView={queryViewForm.type}
        shiftTimeViewData={shiftTimeViewData}
        roleViewData={roleViewData}
        employeeViewData={employeeViewData}
        onShiftItemClick={handleShiftItemClick}
        onRoleViewDragEnd={handleRoleViewDragEnd}
        onEmployeeViewDragEnd={handleEmployeeViewDragEnd}
        onShiftTimeDragStop={handleShiftTimeDragStop}
        onShiftTimeResizeStop={handleShiftTimeResizeStop}
        onAddShiftClick={({ dayOfWeek, workerRoleId, userId }) => {
          setAddShiftDialogInfo({
            open: true,
            shiftId: "",
            dayOfWeek: [dayOfWeek],
            workerRoleId,
            userId,
          });
        }}
      />

      {AddShiftDialogInfo.open && (
        <AddShiftDialog
          communityId={communityId as string}
          templateId={templateId}
          departmentId={departmentId}
          shiftId={AddShiftDialogInfo.shiftId}
          dayOfWeek={AddShiftDialogInfo.dayOfWeek}
          workerRoleId={AddShiftDialogInfo.workerRoleId}
          userId={AddShiftDialogInfo.userId}
          onClose={() => {
            setAddShiftDialogInfo({
              ...defaultAddShiftDialogInfo,
            });
          }}
          onSuccess={() => {
            loadGetScheduleTemplateShiftList();
            loadGetScheduleTemplateShiftRoleList();
          }}
          onClear={(shiftId) => {
            setSelectShiftIds(selectShiftIds.filter((id) => id !== shiftId));
          }}
        />
      )}

      <ConfirmDialog
        open={isShowBulkDeleteDialog}
        onClose={() => {
          setIsShowBulkDeleteDialog(false);
        }}
        onOk={handleBulkDeleteShift}
      >
        Are you sure you want to delete the selected shifts?
      </ConfirmDialog>

      {isShowBulkEditDialog && (
        <BulkEditDialog
          templateId={templateId}
          departmentId={departmentId}
          communityId={communityId as string}
          selectShiftIds={selectShiftIds}
          selectShift={selectShift}
          onClose={() => {
            setIsShowBulkEditDialog(false);
          }}
          onSuccess={() => {
            loadGetScheduleTemplateShiftList();
            loadGetScheduleTemplateShiftRoleList();
          }}
          onClear={() => {
            setSelectShiftIds([]);
          }}
        />
      )}
    </PageContainer>
  );
};

export default Page;

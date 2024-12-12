import { useDebounceFn, useSetState } from "ahooks";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { toast } from "react-toastify";

import { getDptSelect } from "@/api/department";
import { PaginationType } from "@/api/types";
import {
  addWorkerRole,
  editWorkerRole,
  getEmployeeList,
  getJobCode,
  getRoleJob,
} from "@/api/workerRole";
import AddSelect, { OptionType } from "@/components/custom/AddSelect";
import Button from "@/components/custom/Button";
import ColorPicker from "@/components/custom/ColorPicker/colorPicker";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import CustomInput from "@/components/custom/Input";
import Select from "@/components/custom/Select";
import CustomTable from "@/components/custom/Table";
import { FormField } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MESSAGE } from "@/constant/message";
import XCloseIcon from "~/icons/CloseIcon.svg";
import QuestionIcon from "~/icons/QuestionIcon.svg";

import useFormCreate from "../hooks/form";
import useInnnerFormCreate from "../hooks/innerFom";
import useReturnTableColumn from "../hooks/tableAdminColumn";
import {
  AddWorkerRoleParams,
  EditWorkerRoleParams,
  GetRoleJobRes,
  RolesParams,
  WorkerRoleDept,
  WorkerRoleVo,
} from "../types";
import CreateAdminInnerTable from "./createAdminInnerTable";
import CreateInnerTable from "./CreateInnerTable";

/**
 * @description Form Props
 */
interface CreateDiaProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: WorkerRoleVo | null;
  editInnerItem: WorkerRoleDept | null;
  onClose: () => void;
  getLsit: () => void;
  communityId: string;
}

/**
 * @description Form Dialog
 */
let tableEmployeeData: any[] = [];
const CreateDia = (props: CreateDiaProps) => {
  const { open, editItem, setOpen, onClose, getLsit, communityId } = props;
  const pathname = usePathname();
  const { form } = useFormCreate({ editItem, open });

  const [editInnerItem, setEditInnerItem] = useState(null);
  const { innerForm } = useInnnerFormCreate({ editInnerItem, open });
  const [loading, setLoading] = useState(false);
  const [roleNameList, setRoleNameList] = useState<OptionType[]>([]);
  const [roleNameOrnList, setRoleNameOrnList] = useState<GetRoleJobRes[]>([]);

  const [jobCodeList, setJobCodeListList] = useState<OptionType[]>([]);
  const [toggleDailog, setToggleDailog] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [departmentAllList, setDepartmentAllList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [isHppd, setIsHppd] = useState(false);
  const [isInnerForm, setIsInnerForm] = useState(false);
  const [operateId, setOperateId] = useState("");
  const personRef = useRef();
  const [employeeVal, setEmployeeVal] = useState("");
  const [isAdmin, setIsAdmin] = useState(true);
  const tableRef = useRef(null);
  const [searchParams, setSearchParams] = useSetState<RolesParams>({
    username: "",
  });
  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });
  const [adminOrEmpData, setAdminOrEmpData] = useState([]);
  // Table column
  const { columns } = useReturnTableColumn({
    pagination,
    searchParams,
    isAdmin,
  });
  const [color, setColor] = useState("#000000");
  const { run } = useDebounceFn(
    () => {
      const arr: any = tableEmployeeData.filter(
        (item: { username: string }) => {
          if (item.username.toLowerCase().includes(employeeVal.toLowerCase())) {
            return item;
          }
        }
      );
      setTableEmpData(arr);
    },
    {
      wait: 500,
    }
  );

  useEffect(() => {
    getAdminEmployeeList();
  }, [searchParams, pagination.pageNum, pagination.pageSize]);
  const [tableEmpData, setTableEmpData] = useState([]);
  useEffect(() => {
    getSelectDepartment(communityId);
    getSelectJobCode(communityId);
  }, []);
  useEffect(() => {
    if (editItem) {
      if (editItem.departmentWorkRoleVos) {
        const arr = editItem.departmentWorkRoleVos.map((item: any) => {
          return {
            name: item.departmentName,
            code: item.departmentId,
            id: item.departmentId,
            hppdTargetHour:
              item.isHppd == false
                ? ""
                : item.hppdTargetHour
                ? Number(item.hppdTargetHour) % 1 !== 0
                  ? Number(item.hppdTargetHour).toFixed(2)
                  : Number(item.hppdTargetHour).toFixed(0)
                : "",
          };
        });
        setTableData(arr);
        const newEditItem: any = editItem;
        tableEmployeeData = newEditItem.employeeList || [];
        newEditItem.employeeList && setTableEmpData(newEditItem.employeeList);
      }
      setColor(editItem.color);
    } else {
      setEmployeeVal("");
      tableEmployeeData = [];
    }
    getSelectRoleJob(communityId);
  }, [editItem]);

  useEffect(() => {
    if (!open) {
      setTableData([]);
    }
  }, [open]);
  const getAdminEmployeeList = async () => {
    const res = await getEmployeeList({
      communityId: communityId,
      workerRoleId: editItem?.id,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      username: searchParams.username || undefined,
      excludeIds: (
        tableEmpData.map((item: { id: string }) => item.id) || []
      ).join(","),
    } as RolesParams);
    if (res.code === 200) {
      setAdminOrEmpData(res.data.records);
      setPagination({
        total: res.data.total,
      });
    }
  };
  // Form Add Info
  const addWorkerRoleFn = async (data: AddWorkerRoleParams) => {
    setLoading(true);
    try {
      if (tableData.length == 0) {
        setLoading(false);
        toast.warning("Please select a department.", {
          position: "top-center",
        });
        return;
      }
      data.communityId = communityId;
      data.departmentLocationRefAOList = tableData.map((item: any) => {
        return {
          departmentId: item?.code,
          hppdTargetHour: item.hppdTargetHour,
        };
      });
      data.color == "" || data.color == null
        ? (data.color = "#000000")
        : data.color;
      const params = {
        ...data,
        employeeList: tableEmpData.map((item: { id: string }) => item.id),
      };
      const res = await addWorkerRole(params);
      if (res.code === 200) {
        toast.success(MESSAGE.create, {
          position: "top-center",
        });

        setOpen(false);
        onClose();
        getLsit();
        setTableEmpData([]);
        setTableData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // role select
  const getSelectRoleJob = async (data: string) => {
    try {
      const res = await getRoleJob(data);
      if (res.code === 200) {
        const result = res.data;

        console.log(editItem);

        const nameList = result.map((item) => {
          if (editItem?.code === item.code) {
            if (item.isSystem) {
              setDisableCode(true);
            }
          }
          return {
            label: item.name,
            value: item.id,
          };
        });
        setRoleNameList(nameList);
        setRoleNameOrnList(result);
      }
    } finally {
    }
  };

  // job select
  const getSelectJobCode = async (data: string) => {
    try {
      const res = await getJobCode(data);
      if (res.code === 200) {
        const result = res.data as any;
        const codeList = result.map((code: string) => {
          return {
            label: code,
            value: code,
          };
        });
        setJobCodeListList(codeList);
      }
    } finally {
    }
  };

  // Form Edit Info
  const editWorkerRoleFn = async (data: EditWorkerRoleParams) => {
    setLoading(true);
    try {
      if (tableData.length == 0) {
        setLoading(false);
        toast.warning("Please select a department.", {
          position: "top-center",
        });
        return;
      }

      data.communityId = communityId;
      data.departmentLocationRefAOList = tableData.map((item: any) => {
        return {
          departmentId: item?.code,
          hppdTargetHour: item.hppdTargetHour,
        };
      });
      const params = {
        ...data,
        employeeList: tableEmpData.map((item: { id: string }) => item.id),
      };

      const res = await editWorkerRole(params);
      if (res.code === 200) {
        toast.success(MESSAGE.edit, {
          position: "top-center",
        });
        setOpen(false);
        onClose();
        getLsit();
        setTableEmpData([]);
        setTableData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // department select
  const getSelectDepartment = async (data: string) => {
    try {
      const res = await getDptSelect(data, 0);
      if (res.code === 200) {
        const result = res.data as any;
        let newResult = result.map(
          (item: { name: any; id: any; isHppd: any }) => {
            return {
              label: item.name,
              value: item.id,
              isHppd: item.isHppd,
            };
          }
        );

        setDepartmentList(newResult);
        setDepartmentAllList(newResult);
      }
    } finally {
    }
  };

  function handleSetDeptData(data: {
    name: string;
    code: string;
    hppdTargetHour: string;
    id: string;
  }) {
    // find deparmetn info
    const obj: any = departmentAllList.find(
      (item: any) => item.value === data.code
    );
    if (!data.hppdTargetHour || obj.isHppd == false) {
      data.hppdTargetHour = "";
      innerForm.setValue("hppdTargetHour", "");
    }

    data.name = obj.label;
    data.id = obj.value;
    data.code = obj.value;

    // check insert or update
    if (isInnerForm) {
      // update
      let tableIndex = tableData.findIndex((item: any) => item.id == operateId);
      if (tableData && tableIndex !== -1) {
        (tableData as any)[tableIndex] = data;
      }
      setTableData(tableData);
    } else {
      // insert data
      if (
        tableData.findIndex(
          (item: { code: string }) => item.code == data.code
        ) != -1
      ) {
        tableData.map((item: { code: string; hppdTargetHour: string }) => {
          if (item.code === data.code) {
            item.hppdTargetHour = data.hppdTargetHour;
          }
          return item;
        });
      } else {
        const list: any = [...tableData, data];
        setTableData(list);
      }
    }
    setEditInnerItem(null);
    setIsHppd(false);
    setToggleDailog(true);
  }

  function handleAddDepartment(type: number) {
    setSearchParams({
      username: "",
    });
    if (type == 1) {
      setIsInnerForm(false);
      innerForm.reset({
        code: "",
        hppdTargetHour: "",
        id: "",
      });
      setIsAdmin(true);
    } else {
      getAdminEmployeeList();
      setIsAdmin(false);
    }
    setToggleDailog(false);
  }

  function handleEditInnerForm(params: {
    id: string;
    name: any;
    hppdTargetHour: string | undefined;
  }) {
    innerForm.setValue("id", params?.id);
    innerForm.setValue("code", params?.id);
    innerForm.setValue("hppdTargetHour", `${params.hppdTargetHour || ""}`);
    setIsInnerForm(true);
    setOperateId(params?.id);
  }

  function handleSetHidePPD(params: any) {
    const obj: any = departmentAllList.find((one: any) => one.value === params);
    if (obj) {
      setIsHppd(obj.isHppd);
      setTimeout(() => {
        document.getElementById("inputId")?.focus();
      }, 0);
    }
  }

  useEffect(() => {
    let list: any = [];
    departmentAllList.forEach((item: any) => {
      let flag = false;
      tableData.forEach((innerItem: any) => {
        if (innerItem.code === item.value) {
          // edit page
          if (editItem) {
            if (innerItem.code === innerForm?.getValues("code")) {
              flag = false;
            } else {
              flag = true;
            }
          } else {
            flag = true;
          }
        }
      });

      if (!flag) {
        list.push(item);
      }
    });

    handleSetHidePPD(innerForm?.getValues("code"));
    setDepartmentList(list);
  }, [toggleDailog]);

  function handleAdminRemove(type: number) {
    if (type == 1) {
      // admin
    } else {
      // employees
      const current: any = personRef.current;
      const choseData: any = current
        .getSelectedRows()
        .map((item: { original: any }) => item.original);
      if (choseData.length == 0) {
        toast.warning("Please select the data you want to delete.", {
          position: "top-center",
        });
        return;
      }
      const arr = tableEmpData.filter((item: { id: string }) => {
        if (
          choseData.findIndex((one: { id: string }) => one.id == item.id) == -1
        ) {
          return item;
        }
      });
      tableEmployeeData = arr;
      setTableEmpData(arr);
    }
  }

  function handleOkTable() {
    const current: any = tableRef.current;
    const choseData: any = current.getSelectedRows().map((item: any) => {
      return item.original;
    });

    if (!choseData || choseData.length == 0) {
      toast.warning("Please select at least one record.", {
        position: "top-center",
      });
      return;
    }
    if (isAdmin) {
    } else {
      if (tableEmpData.length === 0) {
        tableEmployeeData = choseData;
        setTableEmpData(choseData);
      } else {
        const arr: any = [];
        choseData.map((item: { id: string }) => {
          let tableIndex = tableEmpData.findIndex(
            (one: any) => one.id == item.id
          );
          if (tableIndex == -1) {
            arr.push(item);
          }
          tableEmployeeData = [...tableEmpData, ...arr];
          setTableEmpData([...tableEmpData, ...arr] as any);
        });
      }
    }
    setToggleDailog(true);
  }

  const [disableCode, setDisableCode] = useState(false);

  const roleNameChange = (
    opt: any,
    field: ControllerRenderProps<
      {
        name: string;
        code: string;
        color: string;
      },
      "name"
    >
  ) => {
    console.log(opt);

    if (opt) {
      field.onChange({
        target: {
          value: opt.label,
        },
      });
      const obj = roleNameOrnList.find((item) => item.id === opt.value);
      if (obj && obj?.isSystem) {
        setDisableCode(true);
        form.setValue("code", obj?.code);
      } else {
        setDisableCode(false);
      }
    } else {
      field.onChange({
        target: {
          value: "",
        },
      });
      setDisableCode(false);
    }
  };
  // Dialog Form
  return (
    <>
      {toggleDailog ? (
        <CustomDialog
          title={editItem ? "Edit Role" : "Add Role"}
          open={open}
          onClose={() => {
            onClose();
            setOpen(false);
          }}
        >
          {/* Form - WorkerRole */}
          <CustomForm
            form={form}
            key="form"
            className="pt-4"
            onSubmit={(data) => {
              if (editItem) {
                editWorkerRoleFn({
                  ...data,
                  id: editItem.id,
                });
              } else {
                addWorkerRoleFn(data);
              }
            }}
          >
            <ScrollArea className="pt-0 h-[65vh]">
              <div className="px-6">
                {/* Form Field - $column.javaField */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => {
                    let value = field.value;
                    let obj: any = null;
                    if (value) {
                      obj = { label: value, value: value };
                    }
                    return (
                      <CustomFormItem label="Role Name" required>
                        <AddSelect
                          label="Role Name"
                          placeholder="Please select or enter new role"
                          isSearchable
                          isClearable
                          menuPlacement="bottom"
                          options={roleNameList}
                          setOptions={setRoleNameList}
                          onChange={(opt) => {
                            roleNameChange(opt, field);
                          }}
                          value={obj}
                        ></AddSelect>
                      </CustomFormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => {
                    let value = field.value;
                    let obj: any = null;
                    if (value) {
                      obj = { label: value, value: value };
                    }
                    return (
                      <CustomFormItem label="Job Code">
                        <AddSelect
                          label="Job Code"
                          placeholder="Please select or enter new code"
                          isClearable
                          isSearchable
                          isDisabled={disableCode}
                          menuPlacement="bottom"
                          options={jobCodeList}
                          setOptions={setJobCodeListList}
                          onChange={(opt) => {
                            if (opt) {
                              field.onChange({
                                target: {
                                  value: opt.value,
                                },
                              });
                            } else {
                              field.onChange({
                                target: {
                                  value: "",
                                },
                              });
                            }
                          }}
                          value={obj}
                        ></AddSelect>
                      </CustomFormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => {
                    const { value } = field;

                    return (
                      <CustomFormItem className="relative" label="Role Color">
                        <div className=" h-[40px] items-center relative">
                          <Input
                            className="w-full"
                            placeholder="Role Color."
                            {...field}
                            onBlur={(e) => {
                              setColor(e.target.value);
                            }}
                          ></Input>

                          <div className="absolute top-[9px] right-[10px] z-50">
                            <ColorPicker
                              key={color}
                              value={value}
                              onChange={(color: string) => {
                                form.setValue("color", color);
                                // setColor(form.getValues().color);
                              }}
                            ></ColorPicker>
                          </div>
                        </div>
                        <div className="absolute top-[9px] left-[80px] cursor-pointer">
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger
                                type="button"
                                onClick={(e: any) => {
                                  e.stopPropagation();
                                }}
                              >
                                <QuestionIcon color="var(--primary-color)" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  This is how the role will be displayed on the
                                  calendar.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CustomFormItem>
                    );
                  }}
                />
                <div className="text-[red] font-[390] text-[16px] h-[40px] flex items-center justify-between my-[10px]">
                  <span className="text-sm text-[#324664]">
                    Which Departments do you want to assign this role to?
                  </span>
                  <span
                    className="text-[var(--primary-color)] cursor-pointer"
                    onClick={() => handleAddDepartment(1)}
                  >
                    <span className="mr-[10px]">+</span>
                    <span className="text-sm">Add</span>
                  </span>
                </div>
                <div>
                  <CreateInnerTable
                    communityId={communityId}
                    tableData={tableData}
                    setEditItem={(value: any) => {
                      handleEditInnerForm(value);
                    }}
                    setDeleteSuccess={(row: any) => {
                      const result = tableData.filter(
                        (item: { id: string }) => item.id !== row.id
                      );

                      setTableData(result);
                    }}
                    setToggleDailog={(value: boolean) => {
                      setToggleDailog(value);
                    }}
                    setDepartmentInfoSetting={(value: any) => {
                      if (value && value.code) {
                        handleSetHidePPD(value?.code);
                        setEditInnerItem(value);
                      }
                    }}
                    hideAction={false}
                  />
                </div>
                {pathname === "/myCommunity" && (
                  <>
                    {" "}
                    {/* Employees */}
                    <div className="font-[390] text-[16px] mt-[20px]">
                      <div className="text-sm text-[#324664]">
                        Employees Assigned to This Role
                      </div>
                      <div className="flex items-center justify-between my-[20px]">
                        <div className="flex-1 mr-[30px]">
                          <Input
                            value={employeeVal}
                            onChange={(e) => {
                              setEmployeeVal(e.target.value);
                              run();
                            }}
                            placeholder="Search by name"
                          ></Input>
                        </div>
                        <div className="flex items-center">
                          <span
                            className="text-[#EF4444E5] cursor-pointer flex items-center mr-[30px]"
                            onClick={() => handleAdminRemove(2)}
                          >
                            <span className="mr-[10px]">
                              <XCloseIcon
                                width="8px"
                                height="8px"
                                color="#EF4444E5"
                              />
                            </span>
                            <span className="text-sm">Remove</span>
                          </span>
                          <span
                            className="text-[var(--primary-color)] cursor-pointer"
                            onClick={() => handleAddDepartment(2)}
                          >
                            <span className="mr-[10px]">+</span>
                            <span className="text-sm">Add</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pb-[10px]">
                      <CreateAdminInnerTable
                        communityId={communityId}
                        tableData={tableEmpData}
                        ref={personRef}
                        setEditItem={(value: any) => {}}
                        setDeleteSuccess={(row: any) => {
                          const result = tableEmpData.filter(
                            (item: { id: string }) => item.id !== row.id
                          );
                          tableEmployeeData = result;
                          setTableEmpData(result);
                        }}
                        setToggleDailog={(value: boolean) => {
                          setToggleDailog(value);
                        }}
                        setDepartmentInfoSetting={() => {}}
                        hideAction={false}
                      />
                    </div>
                  </>
                )}

                {/* Dialog Form Btn‘s */}
                <div className="flex gap-6 justify-end mt-[30px]">
                  <Button
                    onClick={() => {
                      setOpen(false);
                      onClose();
                    }}
                    variant="outline"
                    type="button"
                  >
                    Cancel
                  </Button>

                  <Button loading={loading} type="submit">
                    Save
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </CustomForm>
        </CustomDialog>
      ) : (
        <CustomDialog
          title={isAdmin ? "Assign Department" : "Add Employee"}
          open={open}
          onClose={() => {
            setEditInnerItem(null);
            setIsHppd(false);
            setToggleDailog(true);
          }}
        >
          {isAdmin ? (
            <>
              <CustomForm
                form={innerForm}
                key="innerForm"
                className="py-4 px-6"
                onSubmit={(data) => {
                  handleSetDeptData(data);
                }}
              >
                <FormField
                  control={innerForm.control}
                  name="code"
                  render={({ field }) => (
                    <CustomFormItem label="Department" required>
                      <Select
                        options={departmentList}
                        placeholder="Department"
                        onChange={(e) => {
                          handleSetHidePPD(e);
                          field.onChange({
                            target: {
                              value: e,
                            },
                          });
                          innerForm.setValue("id", e);
                        }}
                        value={field.value}
                      />
                    </CustomFormItem>
                  )}
                />
                {isHppd && (
                  <FormField
                    control={innerForm.control}
                    name="hppdTargetHour"
                    render={({ field }) => (
                      <CustomFormItem label="Target Hours Per Resident/Patient Per Day for this Role (HPPD)">
                        <CustomInput
                          placeholder="Target Hours Per Resident/Patient Per Day for this Role (HPPD)"
                          id="inputId"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange({
                              target: {
                                value: e.target.value + "",
                              },
                            });
                          }}
                        />
                      </CustomFormItem>
                    )}
                  />
                )}

                <div className="flex gap-6 justify-end mt-[30px]">
                  <Button
                    onClick={() => {
                      setToggleDailog(true);
                    }}
                    variant="outline"
                    type="button"
                  >
                    Cancel
                  </Button>

                  <Button loading={loading} type="submit">
                    Save
                  </Button>
                </div>
              </CustomForm>
            </>
          ) : (
            <div className="flex flex-col h-[600px]">
              <div className="mb-[20px]">
                <div className="w-full leading-10 ">Name</div>
                <Input
                  value={searchParams.username}
                  onChange={(e) => {
                    setSearchParams({
                      username: e.target.value,
                    });
                  }}
                  placeholder="Name"
                ></Input>
              </div>
              <ScrollArea className="flex-1 mb-[30px]">
                <CustomTable
                  columns={columns}
                  data={adminOrEmpData}
                  ref={tableRef}
                  loading={false}
                  pagination={pagination}
                  height="360px"
                  changePageNum={(pageNum) => {
                    setPagination({ pageNum });
                  }}
                  changePageSize={(pageSize) => {
                    const nowSize =
                      pagination.pageSize * (pagination.pageNum - 1) + 1;

                    const pageNum = Math.ceil(nowSize / pageSize);

                    setPagination({
                      ...pagination,
                      pageSize,
                      pageNum: pageNum,
                    });
                  }}
                />
              </ScrollArea>
              <div className="flex gap-6 justify-end">
                <Button
                  onClick={() => {
                    setToggleDailog(true);
                  }}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>

                <Button
                  loading={loading}
                  type="button"
                  onClick={() => {
                    handleOkTable();
                  }}
                >
                  OK
                </Button>
              </div>
            </div>
          )}
        </CustomDialog>
      )}
    </>
  );
};
export default CreateDia;

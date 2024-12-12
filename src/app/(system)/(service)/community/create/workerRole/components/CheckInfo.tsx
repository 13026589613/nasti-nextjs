import { useDebounceFn } from "ahooks";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getDptSelect } from "@/api/department";
import { addWorkerRole, editWorkerRole, getRoleJob } from "@/api/workerRole";
import AddSelect, { OptionType } from "@/components/custom/AddSelect";
import Button from "@/components/custom/Button";
import ColorPicker from "@/components/custom/ColorPicker";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QuestionIcon from "~/icons/QuestionIcon.svg";

import useFormCreate from "../hooks/form";
import useInnnerFormCreate from "../hooks/innerFom";
import {
  AddWorkerRoleParams,
  EditWorkerRoleParams,
  WorkerRoleDept,
  WorkerRoleVo,
} from "../types";
import CheckInfoInnerTable from "./checkInfoInnerTable";
import CreateInnerTable from "./CreateInnerTable";

/**
 * @description Form Props
 */
interface CreateDiaProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: WorkerRoleVo | null | any;
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
  const {
    open,
    editItem,
    setOpen,
    onClose,
    getLsit,
    communityId,
    editInnerItem,
  } = props;
  const pathname = usePathname();
  const { form } = useFormCreate({ editItem, open });
  const { innerForm } = useInnnerFormCreate({ editInnerItem, open });
  const [_loading, setLoading] = useState(false);
  const [roleNameList, setRoleNameList] = useState<OptionType[]>([]);
  const [jobCodeList, setJobCodeListList] = useState<OptionType[]>([]);
  const [_toggleDailog, setToggleDailog] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [employeeVal, setEmployeeVal] = useState("");
  const [tableEmpData, setTableEmpData] = useState([]);
  useEffect(() => {
    getSelectRoleJob(communityId);
    getSelectDepartment(communityId);
  }, []);
  useEffect(() => {
    if (editItem && editItem.departmentWorkRoleVos) {
      const arr = editItem.departmentWorkRoleVos.map((item: any) => {
        item.name = item.departmentName;
        item.code = item.id;
        return item;
      });
      setTableData(arr);
      const newEditItem: any = editItem;
      tableEmployeeData = newEditItem.employeeList || [];
      newEditItem.employeeList && setTableEmpData(newEditItem.employeeList);
    } else {
      setEmployeeVal("");
      tableEmployeeData = [];
      setTableData([]);
    }
  }, [editItem]);
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
  // Form Add Info
  const addWorkerRoleFn = async (data: AddWorkerRoleParams) => {
    setLoading(true);
    try {
      data.communityId = communityId;
      data.departmentLocationRefAOList = tableData.map((item: any) => {
        const obj: any = departmentList.find(
          (one: any) => one.label === item.name
        );
        return {
          departmentId: obj?.value,
          hppdTargetHour: item.hppdTargetHour,
        };
      });
      const res = await addWorkerRole(data);
      if (res.code === 200) {
        setOpen(false);
        onClose();
        getLsit();
        setTableData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // job and role select
  const getSelectRoleJob = async (data: string) => {
    try {
      const res = await getRoleJob(data);
      if (res.code === 200) {
        const result = res.data as any;
        const nameList = result.map((item: { name: string; code: string }) => {
          return {
            label: item.name,
            value: item.code,
          };
        });
        const codeList = result.map((item: { name: string; code: string }) => {
          return {
            label: item.code,
            value: item.code,
          };
        });
        setRoleNameList(nameList);
        setJobCodeListList(codeList);
      }
    } finally {
    }
  };

  // Form Edit Info
  const editWorkerRoleFn = async (data: EditWorkerRoleParams) => {
    setLoading(true);
    try {
      data.communityId = communityId;
      data.departmentLocationRefAOList = [];
      const res = await editWorkerRole(data);
      if (res.code === 200) {
        setOpen(false);
        onClose();
        getLsit();
        setTableData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // department select
  const getSelectDepartment = async (data: string) => {
    try {
      const res = await getDptSelect(data);
      if (res.code === 200) {
        const result = res.data as any;
        let newResult = result.map((item: { name: any; id: any }) => {
          return {
            label: item.name,
            value: item.id,
          };
        });

        setDepartmentList(newResult);
      }
    } finally {
    }
  };

  function _handleSetDeptData(data: {
    name: string;
    code: string;
    hppdTargetHour: number;
  }) {
    departmentList.map((item: any) => {
      if (item.value == data.code) {
        data.name = item.label;
      }
    });
    if (tableData.findIndex((item: any) => item.code == data.code) === -1) {
      const list: any = [...tableData, data];
      setTableData(list);
    }
    setToggleDailog(true);
  }

  function handleGetColor(value: string) {
    // form.setValue("color", value);
  }
  function handleEditInnerForm(params: {
    name: any;
    hppdTargetHour: string | undefined;
  }) {
    const obj: any = departmentList.find(
      (one: any) => one.label === params.name
    );
    innerForm.setValue("code", obj?.value);
    innerForm.setValue("hppdTargetHour", params.hppdTargetHour);
  }
  // Dialog Form
  return (
    <>
      <CustomDialog
        title="View Role"
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
          className="py-4 px-6"
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
          <div className="pt-0 pb-4  max-h-[80vh] overflow-auto">
            {/* Form Field - $column.javaField */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                let value = field.value;
                let obj: any = {};
                if (value) {
                  obj = { label: value, value: value };
                }
                return (
                  <CustomFormItem label="Role Name" required>
                    <AddSelect
                      label="Role Name"
                      placeholder="Please select or enter new department"
                      isSearchable
                      menuPlacement="bottom"
                      options={roleNameList}
                      setOptions={setRoleNameList}
                      onChange={(opt) => {
                        if (opt) {
                          form.setValue("name", opt.label);
                        } else {
                          form.setValue("name", "");
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
              name="code"
              render={({ field }) => {
                let value = field.value;
                let obj: any = {};
                if (value) {
                  obj = { label: value, value: value };
                }
                return (
                  <CustomFormItem label="Job Code">
                    <AddSelect
                      label="Job Code"
                      isDisabled
                      placeholder="Please select or enter new code"
                      isSearchable
                      menuPlacement="bottom"
                      options={jobCodeList}
                      setOptions={setJobCodeListList}
                      onChange={(opt) => {
                        if (opt) {
                          form.setValue("code", opt.label);
                        } else {
                          form.setValue("code", "");
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
              render={({ field }) => (
                <CustomFormItem className="relative" label="Role Color">
                  <div className="flex h-[40px]  items-center">
                    <ColorPicker
                      value={field.value}
                      onChange={handleGetColor}
                      disabled
                    />
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
              )}
            />
            <div className="text-[red] font-[390] text-[16px] h-[40px] flex items-center justify-between my-[10px]">
              <span className="text-sm text-[#324664]">
                Which Departments do you want to assign this role to?
              </span>
            </div>
            <div>
              <CreateInnerTable
                hideAction
                communityId="communityId"
                tableData={tableData}
                setEditItem={(value: any) => {
                  handleEditInnerForm(value);
                }}
                setToggleDailog={(value: boolean) => {
                  setToggleDailog(value);
                }}
              />
            </div>
            {pathname === "/myCommunity" && (
              <>
                {" "}
                {/* Employees */}
                <div className="font-[390] text-[16px] mt-[20px]">
                  <div className="text-sm text-[#324664]">
                    Employees Assigned to This Department
                  </div>
                  <div className="flex items-center justify-between my-[20px]">
                    <div className="flex-1">
                      <Input
                        value={employeeVal}
                        onChange={(e) => {
                          setEmployeeVal(e.target.value);
                          run();
                        }}
                        placeholder="Search by name"
                      ></Input>
                    </div>
                    {/* <div className="flex items-center">
                <span
                  className="text-[#EF4444E5] cursor-pointer flex items-center mr-[30px]"
                  onClick={() => handleAdminRemove(2)}
                >
                  <span className="mr-[10px]">
                    <XCloseIcon width="12px" height="12px" color="#EF4444E5" />
                  </span>
                  Remove
                </span>
                <span
                  className="text-[var(--primary-color)] cursor-pointer"
                  onClick={() => handleAddDepartment(2)}
                >
                  <span className="mr-[10px]">+</span>Add
                </span>
              </div> */}
                  </div>
                </div>
                <div className="pb-[10px]">
                  <CheckInfoInnerTable
                    communityId={communityId}
                    tableData={tableEmpData}
                    setEditItem={(value: any) => {}}
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
                  onClose();
                  setTableData([]);
                  setOpen(false);
                }}
                variant="outline"
                type="button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CustomForm>
      </CustomDialog>
    </>
  );
};
export default CreateDia;

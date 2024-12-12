import { useDebounceFn } from "ahooks";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getLocationList } from "@/api/department";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import CustomCreatableSelect from "@/components/custom/Select/creatableSelect";
import { FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

import useFormCreate from "../hooks/form";
import { DepartmentVo } from "../types";
import CheckInfoInnerTable from "./checkInfoInnerTable";

/**
 * @description Form Props
 */
interface CreateDiaProps {
  communityId: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: DepartmentVo | null;
  onClose: () => void;
  getLsit: () => void;
}

/**
 * @description Form Dialog
 */
let tableAdminData: any[] = [];
let tableEmployeeData: any[] = [];
const CreateDia = (props: CreateDiaProps) => {
  const { open, editItem, setOpen, onClose, communityId } = props;
  const pathname = usePathname();
  const { form } = useFormCreate({ editItem, open });
  const [_autoFocus, _setAutoFocus] = useState(false);
  const [LocationList, setLocationList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [adminVal, setAdminVal] = useState("");
  const [tableEmpData, setTableEmpData] = useState([]);
  const [employeeVal, setEmployeeVal] = useState("");
  const [isAdmin, setIsAdmin] = useState(true);
  const adminRef = useRef();
  const personRef = useRef();
  const { run } = useDebounceFn(
    () => {
      if (isAdmin) {
        const arr: any = tableAdminData.filter((item: { username: string }) => {
          if (item.username.toLowerCase().includes(adminVal.toLowerCase())) {
            return item;
          }
        });
        setTableData(arr);
      } else {
        const arr: any = tableEmployeeData.filter(
          (item: { username: string }) => {
            if (
              item.username.toLowerCase().includes(employeeVal.toLowerCase())
            ) {
              return item;
            }
          }
        );
        setTableEmpData(arr);
      }
    },
    {
      wait: 500,
    }
  );
  useEffect(() => {
    run();
  }, [adminVal, employeeVal]);
  // Location list
  const getLocationDataList = async (data: string) => {
    try {
      const res = await getLocationList(data);
      if (res.code === 200) {
        const arr = res.data.map((item: any) => {
          return {
            label: item.name,
            value: item.id,
          };
        }) as [];
        setLocationList(arr);
      }
    } finally {
    }
  };

  useEffect(() => {
    getLocationDataList(communityId);

    if (editItem) {
      if (editItem.locationList) {
        const valueList: string[] = editItem.locationList.map((item) => {
          return item.locationId;
        });

        form.setValue("location", valueList);
      }
      const newEditItem: any = editItem;
      tableAdminData = newEditItem.adminList || [];
      tableEmployeeData = newEditItem.employeeList || [];
      newEditItem.adminList && setTableData(newEditItem.adminList);
      newEditItem.employeeList && setTableEmpData(newEditItem.employeeList);
    } else {
      tableAdminData = [];
      tableEmployeeData = [];
      setAdminVal("");
      setEmployeeVal("");
      setTableData([]);
      setTableEmpData([]);
    }
  }, [editItem, open]);
  // Dialog Form
  return (
    <CustomDialog
      title={"View Department"}
      open={open}
      onClose={() => {
        onClose();
        setOpen(false);
      }}
    >
      {/* Form - Department */}
      <CustomForm form={form} className="py-4 px-6" onSubmit={(data) => {}}>
        <div className="pt-0 pb-4 px-6 max-h-[80vh] overflow-auto">
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
                <CustomFormItem label="Department Name" required>
                  <Input
                    value={obj.label}
                    disabled
                    onChange={(e) => {}}
                    placeholder=""
                  ></Input>
                </CustomFormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <CustomFormItem label="Department Description">
                <Textarea
                  disabled
                  placeholder=""
                  className="placeholder:text-[#919FB4]"
                  {...field}
                />
              </CustomFormItem>
            )}
          />
          {/* form.setValue("location", opt.label) */}
          {/* when edit is hidden */}
          {
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => {
                let value = field.value;
                let arr: any = [];
                if (value && typeof value !== "string") {
                  arr = (value as []).map((val: string) => {
                    const item: any = LocationList.find(
                      (loc: any) => loc.value === val
                    );
                    return {
                      label: item ? item.label : val,
                      value: val,
                    };
                  });
                }

                return (
                  <CustomFormItem className="relative" label="Location">
                    <CustomCreatableSelect
                      isMulti
                      isSearchable
                      isDisabled
                      options={LocationList}
                      onChange={(e) => {
                        const newValue =
                          e == null ? [] : e.map((item: any) => item.value);
                        field.onChange({
                          target: {
                            value: newValue,
                          },
                        });
                      }}
                      placeholder=""
                      value={arr}
                    ></CustomCreatableSelect>
                  </CustomFormItem>
                );
              }}
            />
          }

          <FormField
            control={form.control}
            name="newIsHppd"
            render={({ field }) => (
              <CustomFormItem label="Do you need to schedule based off of hours per resident per day (HPPD)?">
                <RadioGroup className="flex" value={field.value} disabled>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="r1" />
                    <Label
                      htmlFor="r1"
                      className="text-[#919FB4] font-[500] text-[14px]"
                    >
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="r2" />
                    <Label
                      htmlFor="r2"
                      className="text-[#919FB4] font-[500] text-[14px]"
                    >
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </CustomFormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newIsReportPbjHour"
            render={({ field }) => (
              <CustomFormItem label="Do you need to report PBJ Hours?">
                <RadioGroup className="flex" value={field.value} disabled>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="r1" />
                    <Label
                      htmlFor="r1"
                      className="text-[#919FB4] font-[500] text-[14px]"
                    >
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="r2" />
                    <Label
                      htmlFor="r2"
                      className="text-[#919FB4] font-[500] text-[14px]"
                    >
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </CustomFormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newIsTrackCensus"
            render={({ field }) => (
              <CustomFormItem label="Does this Department track census?">
                <RadioGroup className="flex" value={field.value} disabled>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="r1" />
                    <Label
                      htmlFor="r1"
                      className="text-[#919FB4] font-[500] text-[14px]"
                    >
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="r2" />
                    <Label
                      htmlFor="r2"
                      className="text-[#919FB4] font-[500] text-[14px]"
                    >
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </CustomFormItem>
            )}
          />

          {pathname === "/myCommunity" && (
            <>
              <div className="font-[390] text-[16px] mt-[20px]">
                <div className="text-sm text-[#324664]">
                  Admin Users Assigned to This Department
                </div>
                <div className="flex items-center justify-between my-[20px]">
                  <div className="flex-1">
                    <Input
                      value={adminVal}
                      onChange={(e) => {
                        setIsAdmin(true);
                        setAdminVal(e.target.value);
                      }}
                      placeholder="Search by name"
                    ></Input>
                  </div>
                </div>
              </div>
              <div>
                <CheckInfoInnerTable
                  communityId={communityId}
                  tableData={tableData}
                  ref={adminRef}
                  setEditItem={(value: any) => {}}
                  setDeleteSuccess={(row: any) => {
                    const result = tableData.filter(
                      (item: { userId: string }) => item.userId !== row.userId
                    );
                    tableAdminData = result;
                    setTableData(result);
                  }}
                  setDepartmentInfoSetting={() => {}}
                  hideAction={false}
                />
              </div>
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
                        setIsAdmin(false);
                        setEmployeeVal(e.target.value);
                      }}
                      placeholder="Search by name"
                    ></Input>
                  </div>
                </div>
              </div>
              <div>
                <CheckInfoInnerTable
                  communityId={communityId}
                  tableData={tableEmpData}
                  ref={personRef}
                  setEditItem={(value: any) => {}}
                  setDeleteSuccess={(row: any) => {
                    const result = tableEmpData.filter(
                      (item: { userId: string }) => item.userId !== row.userId
                    );
                    tableEmployeeData = result;
                    setTableEmpData(result);
                  }}
                  setDepartmentInfoSetting={() => {}}
                  hideAction={false}
                />
              </div>
            </>
          )}
          {/* Dialog Form Btn‘s */}
          <div className="flex gap-6 justify-end">
            <Button
              onClick={() => {
                setOpen(false);
                onClose();
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CustomForm>
    </CustomDialog>
  );
};
export default CreateDia;

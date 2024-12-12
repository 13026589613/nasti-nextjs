import { useDebounceFn, useSetState } from "ahooks";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";

import {
  addDepartment,
  editDepartment,
  getAdminList,
  getDepartmentList,
  getEmployeeList,
  getLocationList,
} from "@/api/department";
import { getEmployeeListPage } from "@/api/employees";
import { OrderByType, PaginationType } from "@/api/types";
import { GetTypeEmployeeParams } from "@/app/(system)/(service)/employees/type";
import AddSelect, { OptionType } from "@/components/custom/AddSelect";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import CustomTable, { RefProps } from "@/components/custom/Table";
import { FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE } from "@/constant/message";
import useAppStore from "@/store/useAppStore";
import useUserStore from "@/store/useUserStore";
import XCloseIcon from "~/icons/CloseIcon.svg";

import useFormCreate from "../hooks/form";
import useReturnTableColumn from "../hooks/tableAdminColumn";
import {
  AddDepartmentParams,
  DepartmentEmployeeParams,
  DepartmentVo,
  EditDepartmentParams,
} from "../types";
import CreateAdminInnerTable from "./createAdminInnerTable";
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
  editInnerItem?: any;
}

/**
 * @description Form Dialog
 */
let tableAdminData: any[] = [];
let tableEmployeeData: any[] = [];
const CreateDia = (props: CreateDiaProps) => {
  const { open, editItem, setOpen, onClose, getLsit, communityId } = props;
  const pathname = usePathname();
  const { userInfo } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const { form } = useFormCreate({ editItem, open });
  const [loading, setLoading] = useState(false);
  const [_autoFocus, _setAutoFocus] = useState(false);
  const [departmentDataList, setDepartmentDataList] = useState<OptionType[]>(
    []
  );
  const [LocationList, setLocationList] = useState([]);
  const [locationNewList, setLocationNewList] = useState<OptionType[]>([]);
  const [tableData, setTableData] = useState([]);
  const [tableEmpData, setTableEmpData] = useState([]);
  const [toggleDailog, setToggleDailog] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [pagination, setPagination] = useSetState<PaginationType>({
    pageNum: 1,
    pageSize: 15,
    total: 10,
  });
  const [searchParams, setSearchParams] = useSetState<DepartmentEmployeeParams>(
    {
      username: "",
    }
  );
  const [adminOrEmpData, setAdminOrEmpData] = useState<any>([]);
  const [orderBy, setOrderBy] = useState<OrderByType>([]);
  const [yesNo, setYesNo] = useState(false);
  const [adminVal, setAdminVal] = useState("");
  const [employeeVal, setEmployeeVal] = useState("");
  const tableRef = useRef<RefProps>();
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
  const getList = async (params?: GetTypeEmployeeParams) => {
    let orderByString = "";
    orderBy.forEach((item) => {
      orderByString = `${item.key} ${item.order}`;
    });
    const res = await getEmployeeListPage(
      params
        ? params
        : ({
            ...searchParams,
            pageNum: pagination.pageNum,
            pageSize: pagination.pageSize,
            orderBy: orderByString,
          } as GetTypeEmployeeParams)
    );
    if (res.code === 200) {
      const { records, total } = res.data;
      setAdminOrEmpData(records);
      setPagination({
        total: total,
      });
    }
  };
  // Table column
  const { columns } = useReturnTableColumn({
    orderBy,
    pagination,
    searchParams,
    setOrderBy,
    getList,
    isAdmin,
  });
  useEffect(() => {
    run();
  }, [adminVal, employeeVal]);

  useEffect(() => {
    getAdminEmployeeList(isAdmin ? 1 : 2);
  }, [searchParams, pagination.pageNum, pagination.pageSize]);

  const getAdminEmployeeList = async (type: number) => {
    const api = type == 1 ? getAdminList : getEmployeeList;
    const tbIds = (
      tableData.map(
        (item: { userCommunityRefId: string }) => item.userCommunityRefId
      ) || []
    ).join(",");
    const edIds = (
      tableEmpData.map(
        (item: { userCommunityRefId: string }) => item.userCommunityRefId
      ) || []
    ).join(",");
    const res = await api({
      communityId: communityId,
      departmentId: editItem?.id,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      username: searchParams.username || undefined,
      excludeUserCommunityRefIds: type == 1 ? tbIds : edIds,
    } as DepartmentEmployeeParams);
    if (res.code === 200) {
      setAdminOrEmpData(res.data.records);
      setPagination({
        total: res.data.total,
      });
    }
  };

  // Form Add Info
  const addDepartmentFn = async (
    data: AddDepartmentParams & {
      locationRefs: {
        locationId?: string;
        name?: string;
      }[];
    }
  ) => {
    setLoading(true);
    try {
      let locationRefs: {
        locationId?: string;
        name?: string;
      }[] = [];
      locationNewList.forEach((item) => {
        let obj: {
          locationId?: string;
          name?: string;
        } = {};
        if (item.__isNew__) {
          obj.name = item.label;
        } else {
          obj.locationId = item.value;
        }
        locationRefs.push(obj);
      });

      data.isHppd = data.newIsHppd == "Yes" ? true : false;
      data.isReportPbjHour = data.newIsReportPbjHour == "Yes" ? true : false;
      data.isTrackCensus = data.newIsTrackCensus == "Yes" ? true : false;

      let adminList = tableData.map(
        (item: { userCommunityRefId: string }) => item.userCommunityRefId
      );
      if (
        adminList.length == 0 &&
        pathname !== "/myCommunity" &&
        userInfo?.id
      ) {
        adminList = [userInfo.id];
      }

      const params = {
        ...data,
        isHppd: data.newIsHppd === "Yes" ? true : false,
        isReportPbjHour: data.newIsReportPbjHour === "Yes" ? true : false,
        isTrackCensus: data.newIsTrackCensus === "Yes" ? true : false,
        locationRefs: locationRefs,
        communityId: communityId,
        adminList: adminList,
        employeeList: tableEmpData.map(
          (item: { userCommunityRefId: string }) => item.userCommunityRefId
        ),
      };
      const res = await addDepartment(params);
      if (res.code === 200) {
        toast.success(MESSAGE.create, {
          position: "top-center",
        });
        setOpen(false);
        onClose();
        getLsit();
        useAppStore.getState().setIsRefreshDepartment(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Form Edit Info
  const editDepartmentFn = async (data: EditDepartmentParams) => {
    setLoading(true);
    data.communityId = communityId;
    data.isHppd = data.newIsHppd == "Yes" ? true : false;
    data.isReportPbjHour = data.newIsReportPbjHour == "Yes" ? true : false;
    data.isTrackCensus = data.newIsTrackCensus == "Yes" ? true : false;
    let locationRefs: {
      locationId?: string;
      name?: string;
    }[] = [];
    locationNewList.forEach((item) => {
      let obj: {
        locationId?: string;
        name?: string;
      } = {};
      if (item.__isNew__) {
        obj.name = item.label;
      } else {
        obj.locationId = item.value;
      }
      locationRefs.push(obj);
    });
    data.locationRefs = locationRefs;
    const { newIsHppd, newIsReportPbjHour, ...params } = data;
    try {
      const newParams = {
        ...params,
        adminList: tableData.map(
          (item: { userCommunityRefId: string }) => item.userCommunityRefId
        ),
        employeeList: tableEmpData.map(
          (item: { userCommunityRefId: string }) => item.userCommunityRefId
        ),
      };
      const res = await editDepartment(newParams);
      if (res.code === 200) {
        toast.success(MESSAGE.edit, {
          position: "top-center",
        });
        setOpen(false);
        useAppStore.getState().setIsRefreshDepartment(true);
        onClose();
        getLsit();
      }
    } finally {
      setLoading(false);
    }
  };

  // department name list
  const getDepartmentNameList = async (data: string) => {
    try {
      const res = await getDepartmentList(data);
      if (res.code === 200) {
        const arr = res.data.map((item: any) => {
          return {
            label: item,
            value: item,
          };
        }) as [];
        setDepartmentDataList(arr);
      }
    } finally {
    }
  };

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
    getDepartmentNameList(communityId);
    getLocationDataList(communityId);

    if (editItem) {
      if (editItem.locationList) {
        const valueList: string[] = editItem.locationList.map((item) => {
          return item.locationId;
        });

        const locationArr = editItem.locationList.map((item) => {
          return {
            label: item.locationName as string,
            value: item.locationId as string,
          };
        });
        setLocationNewList(locationArr);
        form.setValue("location", valueList);
      }
      const newEditItem: any = editItem;
      tableAdminData = newEditItem.adminList || [];
      tableEmployeeData = newEditItem.employeeList || [];
      newEditItem.adminList && setTableData(newEditItem.adminList);
      newEditItem.employeeList && setTableEmpData(newEditItem.employeeList);
      if (editItem && (editItem as any).newIsHppd == "Yes") {
        setYesNo(true);
      } else {
        setYesNo(false);
      }
    } else {
      if (form.getValues().newIsHppd == "Yes") {
        setYesNo(true);
      } else {
        setYesNo(false);
      }
      tableAdminData = [];
      tableEmployeeData = [];
      setAdminVal("");
      setEmployeeVal("");
      setTableData([]);
      setTableEmpData([]);
    }
  }, [editItem, open]);

  function handleAddDepartment(type: number) {
    setToggleDailog(false);
    setSearchParams({
      username: "",
    });
    getAdminEmployeeList(type);
    if (type == 1) {
      // admin
      setIsAdmin(true);
    } else {
      // employees
      setIsAdmin(false);
    }
  }

  function handleAdminRemove(type: number) {
    if (type == 1) {
      // admin
      const current: any = adminRef.current;
      const choseData: any = current
        .getSelectedRows()
        .map((item: { original: any }) => item.original);
      if (choseData.length == 0) {
        toast.warning("Please select the data you want to delete.", {
          position: "top-center",
        });
        return;
      }
      const arr = tableData.filter((item: { userId: string }) => {
        if (
          choseData.findIndex(
            (one: { userId: string }) => one.userId == item.userId
          ) == -1
        ) {
          return item;
        }
      });
      tableAdminData = arr;
      setTableData(arr);
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
      const arr = tableEmpData.filter((item: { userId: string }) => {
        if (
          choseData.findIndex(
            (one: { userId: string }) => one.userId == item.userId
          ) == -1
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
      if (tableData.length === 0) {
        tableAdminData = choseData;
        setTableData(choseData);
      } else {
        const arr: any = [];
        choseData.map((item: { userId: string }) => {
          let tableIndex = tableData.findIndex(
            (one: any) => one.userId == item.userId
          );
          if (tableIndex == -1) {
            arr.push(item);
          }
          tableAdminData = [...tableData, ...arr];
          setTableData([...tableData, ...arr] as any);
        });
      }
    } else {
      if (tableEmpData.length === 0) {
        tableEmployeeData = choseData;
        setTableEmpData(choseData);
      } else {
        const arr: any = [];
        choseData.map((item: { userId: string }) => {
          let tableIndex = tableEmpData.findIndex(
            (one: any) => one.userId == item.userId
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

  function handleSetYes() {
    form.setValue("newIsTrackCensus", "Yes");
  }

  return (
    <>
      {toggleDailog ? (
        <CustomDialog
          title={editItem ? "Edit Department" : "Add Department"}
          open={open}
          width="800px"
          onClose={() => {
            onClose();
            setOpen(false);
          }}
        >
          {/* Form - Department */}
          <CustomForm
            form={form}
            className="py-4"
            onSubmit={(data) => {
              if (open) {
                if (editItem) {
                  editDepartmentFn({
                    ...data,
                    id: editItem.id,
                  });
                } else {
                  addDepartmentFn(data);
                }
              }
            }}
          >
            <div className="pt-0 pb-4  max-h-[80vh] overflow-auto">
              {/* Form Field - $column.javaField */}
              <div className="px-6">
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
                      <CustomFormItem label="Department Name" required>
                        <AddSelect
                          label="Department Name"
                          placeholder="Please select or enter new department"
                          isSearchable
                          isClearable
                          menuPlacement="bottom"
                          options={departmentDataList}
                          setOptions={setDepartmentDataList}
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
                  name="description"
                  render={({ field }) => (
                    <CustomFormItem label="Department Description">
                      <Textarea
                        placeholder="Department Description"
                        className="placeholder:text-[#919FB4]"
                        {...field}
                      />
                    </CustomFormItem>
                  )}
                />
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
                            __isNew__: item ? item?.__isNew__ : true,
                          };
                        });
                      }

                      return (
                        <CustomFormItem className="relative" label="Location">
                          <AddSelect
                            label="Location"
                            placeholder="Please select or enter new department"
                            isMulti
                            isSearchable
                            menuPlacement="bottom"
                            options={LocationList}
                            setOptions={setLocationNewList}
                            onChange={(opt) => {
                              setLocationNewList(opt == null ? [] : opt);
                              const newValue =
                                opt == null
                                  ? []
                                  : opt.map((item: any) => item.value);
                              field.onChange({
                                target: {
                                  value: newValue,
                                },
                              });
                            }}
                            value={arr}
                          ></AddSelect>
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
                      <RadioGroup
                        className="flex"
                        value={field.value}
                        onValueChange={(e) => {
                          setYesNo(e == "Yes");
                          if (e == "Yes") handleSetYes();
                          form.setValue("newIsHppd", e);
                          return field.onChange;
                        }}
                      >
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
                      <RadioGroup
                        className="flex"
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
                      <RadioGroup
                        className="flex"
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        disabled={yesNo}
                        value={field.value}
                      >
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
                        <div className="flex-1 mr-[30px]">
                          <Input
                            value={adminVal}
                            onChange={(e) => {
                              setIsAdmin(true);
                              setAdminVal(e.target.value);
                            }}
                            placeholder="Search by name"
                          ></Input>
                        </div>
                        <div className="flex items-center">
                          <span
                            className="text-[#EF4444E5] cursor-pointer flex items-center mr-[30px]"
                            onClick={() => handleAdminRemove(1)}
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
                            onClick={() => handleAddDepartment(1)}
                          >
                            <span className="mr-[10px]">+</span>
                            <span className="text-sm">Add</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[200px]">
                      <CreateAdminInnerTable
                        communityId={communityId}
                        tableData={tableData}
                        ref={adminRef}
                        setEditItem={(value: any) => {}}
                        setDeleteSuccess={(row: any) => {
                          const result = tableData.filter(
                            (item: { userId: string }) =>
                              item.userId !== row.userId
                          );
                          tableAdminData = result;
                          setTableData(result);
                        }}
                        setToggleDailog={(value: boolean) => {
                          setToggleDailog(value);
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
                        <div className="flex-1 mr-[30px]">
                          <Input
                            value={employeeVal}
                            onChange={(e) => {
                              setIsAdmin(false);
                              setEmployeeVal(e.target.value);
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
                    <div>
                      <CreateAdminInnerTable
                        communityId={communityId}
                        tableData={tableEmpData}
                        ref={personRef}
                        setEditItem={(value: any) => {}}
                        setDeleteSuccess={(row: any) => {
                          const result = tableEmpData.filter(
                            (item: { userId: string }) =>
                              item.userId !== row.userId
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
                <div className="flex gap-6 justify-end mt-[20px]">
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
            </div>
          </CustomForm>
        </CustomDialog>
      ) : (
        <CustomDialog
          title={isAdmin ? "Add Admin" : "Add Employee"}
          width="800px"
          open={open}
          onClose={() => {
            setToggleDailog(true);
          }}
        >
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
                height="350px"
                pagination={pagination}
                changePageNum={(pageNum) => {
                  setPagination({ pageNum });
                }}
                changePageSize={(pageSize) => {
                  const nowSize =
                    pagination.pageSize * (pagination.pageNum - 1) + 1;

                  const pageNum = Math.ceil(nowSize / pageSize);

                  setPagination({ ...pagination, pageSize, pageNum: pageNum });
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
        </CustomDialog>
      )}
    </>
  );
};
export default CreateDia;

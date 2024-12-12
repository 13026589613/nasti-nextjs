import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";

import {
  addAdminUser,
  addAndInviteAdminUser,
  checkIsWorkerExists,
  editAdminUser,
  editAndInviteAdminUser,
  getAdminUserInfo,
  unreadPermissionList,
} from "@/api/adminUser";
import { getDptSelect } from "@/api/department";
import {
  messageValidatePhoneNumber,
  messageValidatePhoneNumber4LineType,
} from "@/api/reports";
import AuthProvide from "@/components/custom/Auth";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import CustomPhoneInput from "@/components/custom/PhoneInput/phoneInput";
import CustomSelect from "@/components/custom/Select";
import Spin from "@/components/custom/Spin";
import { TreeNode } from "@/components/custom/Tree";
import { FormField } from "@/components/ui/form";
import { MESSAGE } from "@/constant/message";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useUserInfo from "@/hooks/useUserInfo";
import useAuthStore from "@/store/useAuthStore";

import useFormCreate from "../hooks/form";
import {
  AddAdminUserParams,
  AddAndInviteAdminUserParams,
  AdminUserVo,
  EditAdminUserParams,
  // EditAdminUserParams,
  EditAndInviteAdminUserParams,
  GetAdminUserInfoResponse,
  UnreadPermissionListResponse,
} from "../types";
import AddEmployeeDia from "./addEmployeeDia";
import Permission, { checkIfAllChecked, expendTreeNode } from "./permission";

/**
 * @description Form Props
 */
interface CreateDiaProps {
  open: boolean;
  operateItem: AdminUserVo | null;
  userInfoItemEditable: boolean;
  setOpen: (value: boolean) => void;
  onClose: (isRefresh?: boolean) => void;
  getLsit: () => void;
}
export type AddFormType = UseFormReturn<
  {
    email: string;
    departmentIds: [string, ...string[]];
  },
  any,
  undefined
>;
export type EditFormType = UseFormReturn<
  {
    email: string;
    // phone: string;
    nationalPhone: string;
    firstName: string;
    lastName: string;
    departmentIds: [string, ...string[]];
    title: string;
  },
  any,
  undefined
>;
/**
 * @description Form Dialog
 */
const CreateDia = (props: CreateDiaProps) => {
  const { open, operateItem, userInfoItemEditable, setOpen, onClose } = props;

  const { userId } = useUserInfo();

  const { form } = useFormCreate({
    open,
    isShowMore: userInfoItemEditable && operateItem != null ? true : false,
  });

  const { handleSubmit } = form;
  const [loading, setLoading] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] =
    useState<GetAdminUserInfoResponse | null>(null);
  const [departmentList, setDepartmentList] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  const permissionRef = useRef<any>(null);

  const { communityId } = useGlobalCommunityId();

  const { permission } = useAuthStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const [permissionList, setPermissionList] = useState<
    TreeNode<expendTreeNode>[]
  >([]);

  const getDepartmentList = async (
    communityId: string,
    departmentIds: string[]
  ) => {
    setLoading(true);
    try {
      const res = await getDptSelect(communityId, 0);
      if (res.code === 200) {
        const result: { label: string; value: string }[] = res.data.map(
          (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          }
        );
        getDeptList({
          communityId,
          allDepartment: result,
          userDepartment: departmentIds,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getDeptList = async ({
    communityId,
    allDepartment,
    userDepartment,
  }: {
    communityId: string;
    allDepartment: {
      label: string;
      value: string;
      isDisabled?: boolean;
      isFixed?: boolean;
    }[];
    userDepartment: string[];
  }) => {
    try {
      const res = await getDptSelect(communityId);
      if (res.code === 200) {
        const result: { label: string; value: string }[] = res.data.map(
          (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          }
        );

        let departments = userDepartment;

        setDepartmentList(
          allDepartment
            .map((item) => {
              const adminHas = result.find(
                (result) => result.value === item.value
              );
              const userHas = departments.find((id) => id === item.value);

              if (!adminHas) {
                if (userHas) {
                  return {
                    ...item,
                    isFixed: true,
                  };
                } else {
                  return {
                    ...item,
                    isDisabled: true,
                  };
                }
              }

              return item;
            })
            .sort((a, b) => {
              if (!a.isDisabled && b.isDisabled) {
                return -1;
              } else if (a.isDisabled && !b.isDisabled) {
                return 1;
              } else {
                return 0;
              }
            })
        );
      }
    } finally {
    }
  };

  const getPermission = async (permissionCodes?: string[]) => {
    setLoading(true);
    try {
      const AllPermissionRes = await unreadPermissionList({
        level: "COMMUNITY",
      });

      if (AllPermissionRes.code === 200) {
        const AllPermissionList = buildTree(AllPermissionRes.data);

        const list = initPermissionData(AllPermissionList, permissionCodes);

        checkIfAllChecked(list);
        setPermissionList(list);
      }
    } finally {
      setLoading(false);
    }
  };

  const initPermissionData = (
    list: UnreadPermissionListResponse[],
    permissionCodes?: string[]
  ) => {
    const newList: TreeNode<expendTreeNode>[] = [];
    list.forEach((item) => {
      //@ts-ignore
      const newItem: TreeNode<expendTreeNode> = {
        ...item,
      };
      if (permissionCodes && permissionCodes.includes(item.code)) {
        newItem.checked = true;
      } else {
        newItem.checked = false;
      }

      if (
        (permission && !permission.includes(item.code)) ||
        userId === operateItem?.userId
      ) {
        newItem.disabled = true;
      }

      newItem.title = item.displayName;
      newItem.value = item.code;
      if (item.children) {
        newItem.children = initPermissionData(item.children, permissionCodes);
      }

      newList.push(newItem);
    });

    newList.forEach((item) => {
      if (item.children && item.children.length > 0) {
        let allDisabled = true;
        item.children.forEach((child) => {
          if (!child.disabled) {
            allDisabled = false;
          }
        });

        item.disabled = allDisabled;
      }
    });

    return newList;
  };
  const buildTree = (
    data: UnreadPermissionListResponse[]
  ): UnreadPermissionListResponse[] => {
    const map = new Map<string, UnreadPermissionListResponse>();

    data.forEach((item) => {
      map.set(item.code, { ...item, children: [] });
    });

    const tree: UnreadPermissionListResponse[] = [];

    data.forEach((item) => {
      if (item.parentCode) {
        const parent = map.get(item.parentCode);
        if (parent) {
          parent.children!.push(map.get(item.code)!);
        }
      } else {
        tree.push(map.get(item.code)!);
      }
    });

    return tree;
  };

  const getUserInfo = async () => {
    setLoading(true);
    try {
      const res = await getAdminUserInfo(operateItem?.id as string);
      if (res.code === 200) {
        if (operateItem && userInfoItemEditable) {
          (form as EditFormType).setValue(
            "firstName",
            res.data.firstName ? res.data.firstName : ""
          );
          (form as EditFormType).setValue(
            "lastName",
            res.data.lastName ? res.data.lastName : ""
          );
          // (form as EditFormType).setValue(
          //   "phone",
          //   res.data.phone ? res.data.phone : ""
          // );
          (form as EditFormType).setValue(
            "nationalPhone",
            res.data.nationalPhone ? res.data.nationalPhone : ""
          );
          (form as EditFormType).setValue("title", res.data.title);
        }

        (form as AddFormType).setValue(
          "departmentIds",
          res.data.departmentIds as [string, ...string[]]
        );
        (form as AddFormType).setValue("email", res.data.email);
        setCurrentUserInfo(res.data);
        getPermission(res.data.permissionCodes as string[]);
        getDepartmentList(communityId, res.data.departmentIds);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && permission) {
      if (operateItem) {
        getUserInfo();
      } else {
        getPermission();
        getDepartmentList(communityId, []);
      }
    } else {
      setPermissionList([]);
      setCurrentUserInfo(null);
    }
  }, [open, permission, communityId]);

  // Form Add Info
  const addUserFn = async (data: AddAdminUserParams) => {
    setLoading(true);
    try {
      const res = await addAdminUser(data);
      if (res.code === 200) {
        setOpen(false);
        onClose(true);
        toast.success(MESSAGE.create, {
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const addAndInviteAdminUserFn = async (data: AddAndInviteAdminUserParams) => {
    setLoading(true);
    try {
      const res = await addAndInviteAdminUser(data);
      if (res.code === 200) {
        setOpen(false);
        onClose(true);
        toast.success(MESSAGE.addAndInvite);
      }
    } finally {
      setLoading(false);
    }
  };

  const editAndInviteAdminUserFn = async (
    data: EditAndInviteAdminUserParams
  ) => {
    setLoading(true);
    try {
      const res = await editAndInviteAdminUser(data);
      if (res.code === 200) {
        setOpen(false);
        onClose(true);
        toast.success(MESSAGE.addAndInvite, {
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Form Edit Info
  const editUserCommunityRefFn = async (data: EditAdminUserParams) => {
    setLoading(true);
    try {
      const res = await editAdminUser(data);
      if (res.code === 200) {
        setOpen(false);
        onClose(true);
        toast.success(MESSAGE.edit, {
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const [assignRoleDia, setAssignRoleDia] = useState(false);

  const [assignRoleData, setAssignRoleData] = useState<AddAdminUserParams>(
    {} as any
  );

  const [assignRoleLoading, setAssignRoleLoading] = useState(false);

  const clickAssignRole = async (data: any) => {
    try {
      setAssignRoleLoading(true);
      const res = await checkIsWorkerExists({ communityId, email: data.email });
      if (res.code === 200) {
        if (res.data) {
          toast.warning(MESSAGE.workerExists);
        } else {
          const resList: TreeNode<expendTreeNode>[] =
            permissionRef.current.getSelection();

          setAssignRoleData({
            ...data,
            communityId: communityId,
            permissionCodes: resList.map((item) => item.value),
          });
          setAssignRoleDia(true);
        }
      }
    } finally {
      setAssignRoleLoading(false);
    }
  };

  const clickSaveAndInvite = (data: any) => {
    const res: TreeNode<expendTreeNode>[] =
      permissionRef.current.getSelection();
    if (operateItem) {
      editAndInviteAdminUserFn({
        ...data,
        communityId: communityId,
        id: currentUserInfo?.id as string,
        userId: currentUserInfo?.userId as string,
        permissionCodes: res.map((item) => item.value),
        redirectUrl: location.origin,
      });
    } else {
      addAndInviteAdminUserFn({
        ...data,
        communityId: communityId,
        permissionCodes: res.map((item) => item.value),
        redirectUrl: location.origin,
      });
    }
  };
  // Dialog Form
  return (
    <CustomDialog
      contentWrapperClassName="py-[15px] px-0"
      title={operateItem ? "Edit Admin User" : "Add Admin User"}
      open={open}
      onClose={() => {
        onClose(true);
        setOpen(false);
      }}
    >
      <Spin loading={loading}>
        {/* Form - UserCommunityRef */}
        <CustomForm
          form={form}
          className="py-4 h-[calc(100vh-200px)] overflow-hidden"
          onSubmit={async (data) => {
            const res: TreeNode<expendTreeNode>[] =
              permissionRef.current.getSelection();
            if (currentUserInfo) {
              let dataObj: any = {
                ...data,
                id: currentUserInfo?.id as string,
                userId: currentUserInfo?.userId as string,
                communityId: communityId,
                permissionCodes: res.map((item) => item.value),
              };
              if (data.nationalPhone && userInfoItemEditable) {
                try {
                  const validData = await messageValidatePhoneNumber4LineType(
                    data.nationalPhone.replace(/\s+/g, "")
                  );
                  if (validData.code === 200) {
                    if (
                      validData.data.valid &&
                      validData.data.lineTypeIntelligence?.type !== "landline"
                    ) {
                      dataObj.nationalPhone =
                        "+" +
                        validData.data.callingCountryCode +
                        " " +
                        validData.data.nationalFormat;
                      dataObj.phone = validData.data.phoneNumber.endpoint;
                      editUserCommunityRefFn(dataObj);
                    } else {
                      (form as EditFormType).setError("nationalPhone", {
                        message: "Invalid phone number.",
                      });
                    }
                  }
                } finally {
                }
              } else {
                editUserCommunityRefFn(dataObj);
              }
            } else {
              addUserFn({
                ...data,
                communityId: communityId,
                permissionCodes: res.map((item) => item.value),
              });
            }
          }}
        >
          <div className="w-[calc(100%-10px)] h-[calc(100%-50px)] overflow-auto">
            <div className="w-full overflow-visible px-6">
              {/* Form Field - $column.javaField */}
              {userInfoItemEditable && (
                <FormField
                  control={(form as EditFormType).control}
                  name="firstName"
                  render={({ field }) => (
                    <CustomFormItem required label="First Name">
                      <Input
                        className="w-full"
                        placeholder="First Name"
                        {...field}
                      />
                    </CustomFormItem>
                  )}
                />
              )}

              {userInfoItemEditable && (
                <FormField
                  control={(form as EditFormType).control}
                  name="lastName"
                  render={({ field }) => (
                    <CustomFormItem required label="Last Name">
                      <Input
                        className="w-full"
                        placeholder="Last Name"
                        {...field}
                      />
                    </CustomFormItem>
                  )}
                />
              )}
              {userInfoItemEditable && (
                <FormField
                  control={(form as EditFormType).control}
                  name="nationalPhone"
                  render={({ field }) => (
                    <CustomFormItem required label="Phone Number">
                      <CustomPhoneInput
                        setError={(message = "Invalid phone number.") => {
                          (form as EditFormType).setError("nationalPhone", {
                            message,
                          });
                        }}
                        disabled={currentUserInfo?.nationalPhone ? true : false}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          if (
                            (form as EditFormType).getValues("nationalPhone")
                              .length === 0
                          ) {
                            (form as EditFormType).setError("nationalPhone", {
                              message: "",
                            });
                          }
                        }}
                        placeholder="Phone Number"
                      />
                    </CustomFormItem>
                  )}
                />
              )}
              {userInfoItemEditable && (
                <FormField
                  control={(form as EditFormType).control}
                  name="title"
                  render={({ field }) => (
                    <CustomFormItem label="Title">
                      <Input
                        className="w-full"
                        placeholder="Title"
                        {...field}
                      />
                    </CustomFormItem>
                  )}
                />
              )}
              <FormField
                control={(form as AddFormType).control}
                name="email"
                render={({ field }) => {
                  return (
                    <CustomFormItem required label="Email Address">
                      <Input
                        disabled={operateItem ? true : false}
                        className="w-full"
                        placeholder="Email Address"
                        {...field}
                      />
                    </CustomFormItem>
                  );
                }}
              />
              <FormField
                control={(form as AddFormType).control}
                name="departmentIds"
                render={({ field }) => (
                  <CustomFormItem label="Department" required>
                    <CustomSelect
                      className="w-full"
                      isMulti
                      isSearchable
                      options={departmentList}
                      onChange={(e) => {
                        if (e) {
                          field.onChange({
                            target: {
                              value: e,
                            },
                          });
                        } else {
                          field.onChange({
                            target: {
                              value: [],
                            },
                          });
                        }
                      }}
                      value={field.value}
                    ></CustomSelect>
                  </CustomFormItem>
                )}
              />
              <div className="mt-[14px] text-[#324664] font-[390] text-[14px] leading-10">
                Permissions
              </div>
              <Permission
                ref={permissionRef}
                permissionList={permissionList}
                setPermissionList={setPermissionList}
              ></Permission>
            </div>
          </div>

          {/* Dialog Form Btn‘s */}
          <div className="flex gap-6 justify-end px-6 mt-4">
            <Button
              onClick={() => {
                onClose();
                setOpen(false);
              }}
              variant="outline"
              type="button"
            >
              Cancel
            </Button>

            {!operateItem && (
              <AuthProvide permissionName={["EMPLOYEE_MANAGEMENT_ADD"]}>
                <Button
                  colorStyle="purple"
                  loading={assignRoleLoading}
                  type="button"
                  onClick={() => {
                    form.handleSubmit(clickAssignRole)();
                  }}
                >
                  Assign Role
                </Button>
              </AuthProvide>
            )}

            <Button
              colorStyle={
                !operateItem || operateItem.status === 4 ? "yellow" : undefined
              }
              loading={loading}
              type="submit"
              onClick={async () => {
                if ((form as EditFormType).getValues("nationalPhone")) {
                  const res = await messageValidatePhoneNumber(
                    (form as EditFormType)
                      .getValues("nationalPhone")
                      .replace(/\s+/g, "")
                  );
                  if (res.code === 200) {
                    if (!res.data.valid) {
                      (form as EditFormType).setError("nationalPhone", {
                        message: "Invalid phone number.",
                      });
                    }
                  }
                }
              }}
            >
              Save
            </Button>
            {(!operateItem || operateItem.status === 4) && (
              <Button
                onClick={() => {
                  handleSubmit(clickSaveAndInvite)();
                }}
                loading={loading}
                type="button"
              >
                Save & Invite
              </Button>
            )}
          </div>
        </CustomForm>
      </Spin>
      {assignRoleDia && (
        <AddEmployeeDia
          assignRoleData={assignRoleData}
          open={assignRoleDia}
          onClose={(isAll: boolean) => {
            setAssignRoleDia(false);
            setTimeout(() => {
              if (isAll) {
                onClose(true);
                setOpen(false);
              }
            }, 50);
          }}
        ></AddEmployeeDia>
      )}
    </CustomDialog>
  );
};
export default CreateDia;

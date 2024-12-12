import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";

import {
  addAdminUserAdmin,
  addAndInviteAdminUserAdmin,
  editAdminUserAdmin,
  editAndInviteAdminUserAdmin,
  getAdminUserInfoAdmin,
} from "@/api/admin/adminuser";
import {
  EditAndInviteAdminUserParams,
  RecordVo,
} from "@/api/admin/adminuser/type";
import { checkIsWorkerExists, unreadPermissionList } from "@/api/adminUser";
import { getDptSelect } from "@/api/department";
import {
  messageValidatePhoneNumber,
  messageValidatePhoneNumber4LineType,
} from "@/api/reports";
import { getSuperAdminCommunityList } from "@/api/user";
import Permission, {
  checkIfAllChecked,
  expendTreeNode,
} from "@/app/(system)/(service)/adminUser/components/permission";
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

import {
  AddAdminUserParams,
  AddAndInviteAdminUserParams,
  EditAdminUserParams,
  GetAdminUserInfoResponse,
  UnreadPermissionListResponse,
} from "../../community/types";
import useFormCreate from "../hooks/form";
import AddEmployeeDia from "./addEmployeeDia";

/**
 * @description Form Props
 */
interface CreateDiaProps {
  open: boolean;
  operateItem: RecordVo | null;
  userInfoItemEditable: boolean;
  setOpen: (value: boolean) => void;
  onClose: (isRefresh?: boolean) => void;
  getLsit: () => void;
}
export type AddFormType = UseFormReturn<
  {
    email: string;
    communityId: string;
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
    communityId: string;
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

  const [permissionList, setPermissionList] = useState<
    TreeNode<expendTreeNode>[]
  >([]);

  const getDepartmentList = async (communityId: string) => {
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
        setDepartmentList(result);
      }
    } finally {
      setLoading(false);
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

      newItem.title = item.displayName;
      newItem.value = item.code;
      if (item.children) {
        newItem.children = initPermissionData(item.children, permissionCodes);
      }

      newList.push(newItem);
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
      const res = await getAdminUserInfoAdmin(operateItem?.id as string);
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
          (form as EditFormType).setValue("communityId", res.data.communityId);
          (form as EditFormType).setValue(
            "nationalPhone",
            res.data.nationalPhone ? res.data.nationalPhone : ""
          );
          (form as EditFormType).setValue("title", res.data.title);
        }

        (form as AddFormType).setValue("email", res.data.email);
        (form as AddFormType).setValue("communityId", res.data.communityId);
        (form as AddFormType).setValue(
          "departmentIds",
          res.data.departmentIds as [string, ...string[]]
        );
        setCurrentUserInfo(res.data);
        getPermission(res.data.permissionCodes as string[]);
        getDepartmentList(res.data.communityId);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (operateItem) {
        getUserInfo();
      } else {
        getPermission();
      }
    } else {
      setPermissionList([]);
      setCurrentUserInfo(null);
    }
  }, [open]);

  // Form Add Info
  const addUserFn = async (data: AddAdminUserParams) => {
    setLoading(true);
    try {
      const res = await addAdminUserAdmin(data);
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
      const res = await addAndInviteAdminUserAdmin(data);
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

  const editAndInviteAdminUserFn = async (
    data: EditAndInviteAdminUserParams
  ) => {
    setLoading(true);
    try {
      const res = await editAndInviteAdminUserAdmin(data);
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
      const res = await editAdminUserAdmin(data);
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

  const [communityList, setCommunityList] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  const getCommunityListFn = async () => {
    try {
      const res = await getSuperAdminCommunityList();

      if (res.code == 200) {
        setCommunityList(
          res.data.map((item) => ({ label: item.name, value: item.id }))
        );
      }
    } finally {
    }
  };

  useEffect(() => {
    getCommunityListFn();
  }, []);

  const [assignRoleDia, setAssignRoleDia] = useState(false);

  const [assignRoleData, setAssignRoleData] = useState<AddAdminUserParams>(
    {} as any
  );

  const [assignRoleLoading, setAssignRoleLoading] = useState(false);

  const clickAssignRole = async (data: any) => {
    try {
      setAssignRoleLoading(true);
      const res = await checkIsWorkerExists({
        communityId: data.communityId,
        email: data.email,
      });
      if (res.code === 200) {
        if (res.data) {
          toast.warning(MESSAGE.workerExists);
        } else {
          const resList: TreeNode<expendTreeNode>[] =
            permissionRef.current.getSelection();

          setAssignRoleData({
            ...data,
            communityId: data.communityId,
            permissionCodes: resList.map((item) => item.value),
          });
          setAssignRoleDia(true);
        }
      }
    } finally {
      setAssignRoleLoading(false);
    }
  };

  // Dialog Form
  return (
    <CustomDialog
      contentWrapperClassName="py-[15px] px-0"
      title={operateItem ? "Edit Admin User" : "Add Admin User"}
      open={open}
      onClose={() => {
        onClose();
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
                permissionCodes: res.map((item) => item.value),
              });
            }
          }}
        >
          <div className="w-[calc(100%-10px)] h-[calc(100%-50px)] overflow-auto">
            <div className="w-full overflow-visible px-6">
              {/* Form Field - $column.javaField */}
              <FormField
                control={(form as EditFormType).control}
                name="communityId"
                render={({ field }) => (
                  <CustomFormItem label="Community" required>
                    <CustomSelect
                      className="w-full"
                      isSearchable
                      isDisabled={operateItem ? true : false}
                      options={communityList}
                      onChange={(e) => {
                        field.onChange({
                          target: {
                            value: e,
                          },
                        });
                        if (e) {
                          getDepartmentList(e);
                        } else {
                          setDepartmentList([]);
                        }

                        (form as EditFormType).setValue(
                          "departmentIds",
                          //@ts-ignore
                          undefined
                        );
                      }}
                      value={field.value}
                    ></CustomSelect>
                  </CustomFormItem>
                )}
              />

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
                render={({ field }) => (
                  <CustomFormItem required label="Email Address">
                    <Input
                      disabled={operateItem ? true : false}
                      className="w-full"
                      placeholder="Email Address"
                      {...field}
                    />
                  </CustomFormItem>
                )}
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
                onClick={handleSubmit((data) => {
                  const res: TreeNode<expendTreeNode>[] =
                    permissionRef.current.getSelection();
                  if (operateItem) {
                    editAndInviteAdminUserFn({
                      ...data,
                      id: currentUserInfo?.id as string,
                      userId: currentUserInfo?.userId as string,
                      permissionCodes: res.map((item) => item.value),
                      redirectUrl: location.origin,
                    });
                  } else {
                    addAndInviteAdminUserFn({
                      ...data,
                      permissionCodes: res.map((item) => item.value),
                      redirectUrl: location.origin,
                      email: data.email || "",
                    });
                  }
                })}
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
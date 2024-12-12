import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { getAdminUserInfo, getPermissionTree } from "@/api/adminUser";
import { getDepartmentListDropdown } from "@/api/department";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import CustomInput from "@/components/custom/Input";
import CustomSelect from "@/components/custom/Select";
import Spin from "@/components/custom/Spin";
import { TreeNode } from "@/components/custom/Tree";
import { FormField } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import useUserStore from "@/store/useUserStore";

import useFormCreate from "../hooks/form";
import {
  // EditAdminUserParams,
  GetPermissionTreeResponse,
} from "../types";
import { AddFormType } from "./CreateDia";
import Permission, { checkIfAllChecked, expendTreeNode } from "./permission";

/**
 * @description Form Props
 */
interface CreateDiaProps {
  open: boolean;
  id: string;
  setOpen: (value: boolean) => void;
  onClose: (isRefresh?: boolean) => void;
}

/**
 * @description Form Dialog
 */
const AdminUserViewDia = (props: CreateDiaProps) => {
  const { open, id, setOpen, onClose } = props;
  const { form } = useFormCreate({ open, isShowMore: false });
  const [loading, setLoading] = useState(false);

  const [departmentList, setDepartmentList] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const permissionRef = useRef<any>(null);
  const { operateCommunity, userInfo } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const [permissionList, setPermissionList] = useState<
    TreeNode<expendTreeNode>[]
  >([]);
  const getDepartmentList = async () => {
    setLoading(true);
    try {
      const res = await getDepartmentListDropdown(
        operateCommunity.id as string
      );
      if (res.code === 200) {
        setDepartmentList(
          res.data.map((item) => ({
            label: item.name,
            value: item.id,
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getPermission = async (permissionCodes?: string[]) => {
    setLoading(true);
    try {
      const res = await getPermissionTree({
        userId: userInfo.id as string,
        communityId: operateCommunity.id as string,
      });
      if (res.code === 200) {
        let list = JSON.parse(JSON.stringify(res.data));
        list = initPermissionData(list, permissionCodes);

        checkIfAllChecked(list);
        setPermissionList(list);
      }
    } finally {
      setLoading(false);
    }
  };

  const initPermissionData = (
    list: GetPermissionTreeResponse,
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
      newItem.disabled = true;
      if (item.children) {
        newItem.children = initPermissionData(item.children, permissionCodes);
      }

      newList.push(newItem);
    });
    return newList;
  };

  const getUserInfo = async () => {
    setLoading(true);
    try {
      const res = await getAdminUserInfo(id as string);
      if (res.code === 200) {
        (form as AddFormType).setValue("email", res.data.email);
        (form as AddFormType).setValue(
          "departmentIds",
          res.data.departmentIds as [string, ...string[]]
        );

        getPermission(res.data.permissionCodes as string[]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDepartmentList();
  }, []);

  useEffect(() => {
    if (open) {
      getUserInfo();
    } else {
      setPermissionList([]);
    }
  }, [open]);

  // Dialog Form
  return (
    <CustomDialog
      title={"View Admin User"}
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
          onSubmit={() => {}}
        >
          <ScrollArea className="w-full h-[calc(100%-50px)]">
            <div className="w-full overflow-visible px-6">
              {/* Form Field - $column.javaField */}
              <FormField
                control={(form as AddFormType).control}
                name="email"
                render={({ field }) => (
                  <CustomFormItem label="Email Address">
                    <CustomInput
                      disabled
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
                      isMulti
                      isSearchable
                      isDisabled
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
              <div className="mt-[14px] text-[#324664] font-[390] text-[16px] leading-10">
                Permissions
              </div>
              <Permission
                ref={permissionRef}
                permissionList={permissionList}
                setPermissionList={setPermissionList}
              ></Permission>
            </div>
          </ScrollArea>

          {/* Dialog Form Btn‘s */}
          <div className="flex gap-6 justify-end px-6 mt-4">
            <Button
              onClick={() => {
                setOpen(false);
              }}
              variant="outline"
              type="button"
            >
              Cancel
            </Button>
          </div>
        </CustomForm>
      </Spin>
    </CustomDialog>
  );
};
export default AdminUserViewDia;

import { useEffect, useRef, useState } from "react";

import { getAdminUserInfoAdmin } from "@/api/admin/adminuser";
import { unreadPermissionList } from "@/api/adminUser";
import { getDptSelect } from "@/api/department";
import Permission, {
  checkIfAllChecked,
  expendTreeNode,
} from "@/app/(system)/(service)/adminUser/components/permission";
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

import { UnreadPermissionListResponse } from "../../community/types";
import useFormCreate from "../hooks/form";
import { AddFormType } from "./CreateDia";

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

  const [permissionList, setPermissionList] = useState<
    TreeNode<expendTreeNode>[]
  >([]);
  const getDepartmentList = async (community: string) => {
    setLoading(true);
    try {
      const res = await getDptSelect(community, 0);
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
      newItem.disabled = true;
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
      const res = await getAdminUserInfoAdmin(id as string);
      if (res.code === 200) {
        (form as AddFormType).setValue("email", res.data.email);
        (form as AddFormType).setValue(
          "departmentIds",
          res.data.departmentIds as [string, ...string[]]
        );
        (form as AddFormType).setValue("communityId", res.data.communityId);
        getDepartmentList(res.data.communityId);
        getPermission(res.data.permissionCodes as string[]);
      }
    } finally {
      setLoading(false);
    }
  };

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
                      onChange={(e) => {}}
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

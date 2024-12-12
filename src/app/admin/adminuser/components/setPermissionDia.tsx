import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { checkAdminUserAdmin } from "@/api/admin/adminuser";
import { RecordVo } from "@/api/admin/adminuser/type";
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
import CustomSelect from "@/components/custom/Select";
import { TreeNode } from "@/components/custom/Tree";
import { FormField } from "@/components/ui/form";
import { MESSAGE } from "@/constant/message";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useAuthStore from "@/store/useAuthStore";

import { UnreadPermissionListResponse } from "../../community/types";

interface SetPermissionDiaProps {
  open: boolean;
  back: () => void;
  onSuccess: () => void;
  userInfo: RecordVo;
  refreshList: () => void;
  reason: string;
}
const SetPermissionDia = (props: SetPermissionDiaProps) => {
  const { open, userInfo, reason, back, onSuccess, refreshList } = props;

  const { communityId } = useGlobalCommunityId();

  const [loading, setLoading] = useState(false);

  const FormSchema = z.object({
    reason: z.string().optional(),
    departmentIds: z.array(z.string()).min(1, {
      message: "This field is required.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      departmentIds: [],
    },
  });

  const { permission } = useAuthStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const permissionRef = useRef<any>(null);

  const [departmentList, setDepartmentList] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

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
        getDeptList({
          communityId,
          allDepartment: result,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getDeptList = async ({
    communityId,
    allDepartment,
  }: {
    communityId: string;
    allDepartment: {
      label: string;
      value: string;
      isDisabled?: boolean;
      isFixed?: boolean;
    }[];
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

        setDepartmentList(
          allDepartment
            .map((item) => {
              const adminHas = result.find(
                (result) => result.value === item.value
              );

              if (!adminHas) {
                return {
                  ...item,
                  isDisabled: true,
                };
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

  const getPermission = async () => {
    setLoading(true);
    try {
      const AllPermissionRes = await unreadPermissionList({
        level: "COMMUNITY",
      });

      if (AllPermissionRes.code === 200) {
        const AllPermissionList = buildTree(AllPermissionRes.data);

        const list = initPermissionData(AllPermissionList);

        checkIfAllChecked(list);
        setPermissionList(list);
      }
    } finally {
      setLoading(false);
    }
  };

  const initPermissionData = (list: UnreadPermissionListResponse[]) => {
    const newList: TreeNode<expendTreeNode>[] = [];
    list.forEach((item) => {
      //@ts-ignore
      const newItem: TreeNode<expendTreeNode> = {
        ...item,
      };
      newItem.checked = false;

      if (permission && !permission.includes(item.code)) {
        newItem.disabled = true;
      }

      newItem.title = item.displayName;
      newItem.value = item.code;
      if (item.children) {
        newItem.children = initPermissionData(item.children);
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

  useEffect(() => {
    if (open) {
      getDepartmentList(communityId as string);
      getPermission();
    }
  }, [open]);

  const handleApprove = () => {
    checkAdminUserFn();
  };

  const checkAdminUserFn = async () => {
    setLoading(true);
    const { departmentIds } = form.getValues();
    const res: TreeNode<expendTreeNode>[] =
      permissionRef.current.getSelection();

    const permissionCodes = res.map((item) => item.value);

    let params: any = {
      userId: userInfo.userId,
      type: 1,
      communityId: communityId as string,
      reason,
      departmentIds,
      permissionCodes,
    };

    try {
      const res = await checkAdminUserAdmin(params);
      if (res.code === 200) {
        refreshList();
        toast.success(MESSAGE.approve, {
          position: "top-center",
        });
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog
      title={"Assign Departments & Privileges"}
      open={open}
      onClose={() => {
        back();
      }}
    >
      <div className="h-[calc(100vh-200px)] overflow-hidden">
        <CustomForm
          className="px-1 h-[calc(100%-60px)] overflow-auto"
          form={form}
          onSubmit={(data) => {}}
        >
          <FormField
            control={form.control}
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
        </CustomForm>
        {/* Dialog Form Btn‘s */}
        <div className="flex gap-6 justify-end mt-5">
          <Button
            onClick={() => {
              back();
            }}
            variant="outline"
          >
            Back
          </Button>

          <Button
            onClick={form.handleSubmit(handleApprove)}
            loading={loading}
            type="submit"
          >
            Approve
          </Button>
        </div>
      </div>
    </CustomDialog>
  );
};

export default SetPermissionDia;

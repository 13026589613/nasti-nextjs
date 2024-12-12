import moment from "moment";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { unreadPermissionList } from "@/api/adminUser";
import { createAnnouncement } from "@/api/announcements";
import { getworkerRoleSelect } from "@/api/employees";
import { getUserDepartmentList } from "@/api/user";
import Button from "@/components/custom/Button";
import DatePicker from "@/components/custom/DatePicker";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Select from "@/components/custom/Select";
import { FormField } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE } from "@/constant/message";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import sortListByKey from "@/utils/sortByKey";

import useFormCreate from "../hooks/form";
import { formatDate } from "../hooks/useFormatDate";
interface formData {
  department: string;
  role: string;
  permission: string;
  date: string;
  content: string;
}

interface CreateDiaProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: any | null;
  onClose: () => void;
  getList: () => void;
}
const CreateDia = (props: CreateDiaProps) => {
  const { communityId } = useGlobalCommunityId();
  const { open, editItem, setOpen, onClose, getList } = props;
  const { form } = useFormCreate({ editItem, open });
  const [loading, setLoading] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);
  const [workerRoleList, setWorkerRoleList] = useState([]);
  const [permissionList, setPermissionList] = useState([]);
  const getPermission = async () => {
    try {
      const { code, data } = await unreadPermissionList({
        level: "COMMUNITY",
        type: "MENU",
      });
      if (code === 200 && data) {
        const result: { label: string; value: string }[] = data.map((item) => {
          return {
            label: item.displayName,
            value: item.code,
          };
        });
        setPermissionList(sortListByKey(result) as []);
      }
    } catch (error) {}
  };
  const getDeptList = async () => {
    try {
      const res = await getUserDepartmentList({ communityId });
      if (res.code === 200) {
        const departmentList = res.data.map((item) => ({
          label: item.name,
          value: item.id,
        }));
        setDepartmentList(sortListByKey(departmentList) as []);
      }
    } finally {
      setLoading(false);
    }
  };
  const getRoleList = async () => {
    try {
      if (!communityId) return;
      const res = await getworkerRoleSelect(communityId);
      if (res.code === 200) {
        const result: { label: string; value: string }[] = res.data.map(
          (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          }
        );
        setWorkerRoleList(result as []);
      }
    } finally {
    }
  };

  const getOptionList = () => {
    try {
      getDeptList();
      getRoleList();
      getPermission();
    } catch (error) {}
  };
  useEffect(() => {
    if (open) getOptionList();
  }, [open]);

  const submitForm = async (formData: formData) => {
    try {
      setLoading(true);
      const { content, date, department, permission, role } = formData;

      const params = {
        communityId,
        departmentIds: department
          ? department.split(",")
          : departmentList.map(
              (item: { label: string; value: string }) => item.value
            ),
        roleIds: role
          ? role.split(",")
          : workerRoleList.map(
              (item: { label: string; value: string }) => item.value
            ),
        permissionCodes: permission
          ? permission.split(",")
          : permissionList.map(
              (item: { label: string; value: string }) => item.value
            ),
        expirationDateLocal: formatDate(date),
        content,
      };
      const { code } = await createAnnouncement(params);
      if (code !== 200)
        return toast.error(MESSAGE.createError, { position: "top-center" });
      toast.success(MESSAGE.create, { position: "top-center" });
      setOpen(false);
      getList();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  return (
    <CustomDialog
      title={`${editItem ? "Edit" : "Add"} Announcement`}
      open={open}
      onClose={() => {
        onClose();
        setOpen(false);
      }}
      contentWrapperClassName="p-0"
      footer={
        <div className="pt-[10px]">
          <Button
            className="mr-[10px]"
            onClick={() => {
              setOpen(false);
              onClose();
            }}
            variant="outline"
          >
            Cancel
          </Button>

          <Button
            loading={loading}
            onClick={form.handleSubmit((data) => {
              submitForm(data as formData);
            })}
          >
            Save
          </Button>
        </div>
      }
    >
      <CustomForm form={form} onSubmit={() => {}}>
        <ScrollArea className="pt-0 h-[65vh]">
          <div className="px-6">
            <CustomFormItem label="Recipent" required>
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <CustomFormItem label="">
                    <Select
                      classNamePrefix="placeholder:text-red-900 placeholder:font-bold"
                      placeholder="All Departments"
                      options={departmentList}
                      value={field.value}
                      isMulti
                      isWrap
                      onChange={(opt) => {
                        field.onChange({
                          target: {
                            value: opt.join(","),
                          },
                        });
                      }}
                    />
                  </CustomFormItem>
                )}
              />
              <div className="my-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <CustomFormItem label="">
                      <Select
                        classNamePrefix="placeholder:text-red-900 placeholder:font-bold"
                        placeholder="All Roles"
                        options={workerRoleList}
                        value={field.value}
                        isMulti
                        isWrap
                        onChange={(opt) => {
                          field.onChange({
                            target: {
                              value: opt.join(","),
                            },
                          });
                        }}
                      />
                    </CustomFormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="permission"
                render={({ field }) => (
                  <CustomFormItem label="">
                    <Select
                      classNamePrefix="placeholder:text-red-900 placeholder:font-bold"
                      placeholder="All Permissions"
                      options={permissionList}
                      value={field.value}
                      isMulti
                      isWrap
                      onChange={(opt) => {
                        field.onChange({
                          target: {
                            value: opt.join(","),
                          },
                        });
                      }}
                    />
                  </CustomFormItem>
                )}
              />
            </CustomFormItem>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <CustomFormItem label="Expiration Date" required>
                  <DatePicker
                    value={field.value}
                    onChange={(value) => {
                      field.onChange({
                        target: {
                          value,
                        },
                      });
                    }}
                    allowClear={false}
                    placeholder="Expiration Date"
                    disabledDate={(current) => {
                      return current && current < moment().startOf("day");
                    }}
                    placement="bottom"
                    popupAlign={{ points: ["tl", "bl"], offset: [0, 0] }}
                  ></DatePicker>
                </CustomFormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <CustomFormItem label="Content" required>
                  {" "}
                  <Textarea
                    placeholder="Content"
                    {...field}
                    onChange={(value) => {
                      if (value.target.value?.trim()) {
                        form.clearErrors("content");
                      }

                      field.onChange(value);
                    }}
                  ></Textarea>
                </CustomFormItem>
              )}
            />
          </div>
        </ScrollArea>
      </CustomForm>
    </CustomDialog>
  );
};
export default CreateDia;

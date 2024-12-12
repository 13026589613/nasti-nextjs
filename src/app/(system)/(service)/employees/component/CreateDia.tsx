import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import {
  addEmployee,
  editEmployee,
  editInvite,
  getworkerRoleSelect,
} from "@/api/employees";
import {
  messageValidatePhoneNumber,
  messageValidatePhoneNumber4LineType,
} from "@/api/reports";
import CustomButton from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import CustomInput from "@/components/custom/Input";
import CustomPhoneInput from "@/components/custom/PhoneInput/phoneInput";
import Select from "@/components/custom/Select";
import { FormField } from "@/components/ui/form";
import { MESSAGE } from "@/constant/message";
import { validateEmail } from "@/utils/verifyValidity";

import useFormCreate from "../hooks/form";
import { EmployeesVo } from "../type";
interface CreateDiaProps {
  currentBtn?: string;
  isAdd: boolean;
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: EmployeesVo | null;
  onClose: () => void;
  getLsit: () => void;
  handleClickBtn?: (status: string) => void;
  communityId: string;
  isFocus: boolean;
}
const CreateDia = (props: CreateDiaProps) => {
  const {
    open,
    editItem,
    setOpen,
    onClose,
    handleClickBtn,
    getLsit,
    isAdd,
    communityId,
    currentBtn,
    isFocus,
  } = props;

  if (editItem) {
    // edit
    const { roles, departments }: any = editItem;
    editItem.workerRoleIds = roles.map((item: { id: string }) => item.id);
    editItem.departmentIds = departments.map(
      (item: { deptId: string }) => item.deptId
    );
  }

  const { formAdd: form } = useFormCreate({ editItem, open, isAdd });

  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [workerRoleList, setWorkerRoleList] = useState([]);

  useEffect(() => {
    if (communityId) {
      getRoleList(communityId);
    }
  }, [communityId]);

  const addTypeDictinaryFn = async (data: any, type?: number | undefined) => {
    // Please enter either Email or Phone or both
    if (!data.email && !data.nationalPhone) {
      toast.error("Please enter either Email or Phone or both", {
        position: "top-center",
      });
      return false;
    }
    data.communityId = communityId;
    if (type == 1) {
      // invite
      data.autoInvite = true;
      setInviteLoading(true);
    } else {
      setLoading(true);
    }

    if (!data.phone) {
      Reflect.deleteProperty(data, "nationalPhone");
    }

    try {
      const res = await addEmployee(data);
      if (res.code === 200) {
        toast.success(type === 1 ? MESSAGE.addAndInvite : MESSAGE.create, {
          position: "top-center",
        });
        if (type == 1) {
          // invite
          setInviteLoading(false);
        } else {
          setLoading(false);
        }
        onClose();
        getLsit();
        handleClickBtn?.("Pending");
      }
    } finally {
      if (type == 1) {
        // invite
        setInviteLoading(false);
      } else {
        setLoading(false);
      }
    }
  };
  const editTypeDictinaryFn = async (data: any, type?: number) => {
    const { id, userId, workerId } = editItem || {
      id: "",
      userId: "",
      workerId: "",
    };
    data.id = id;
    data.userId = userId;
    data.communityId = communityId;

    let param: any = {
      ...data,
    };
    if (editItem && editItem.workerId) {
      const terminationDate: any = new Date(data.terminationDate);
      const hireDate: any = new Date(data.hireDate);
      param = {
        ...data,
        terminationDate: moment(terminationDate).format("MM/DD/YYYY"),
        hireDate: moment(hireDate).format("MM/DD/YYYY"),
        workerId: workerId,
      };
    }
    let api = editEmployee;
    if (isAdd) {
      param.userCommunityRefId = editItem && editItem.userCommunityRefId;
      api = editInvite;
    }

    if (type == 1) {
      // invite
      param.autoInvite = true;
      setInviteLoading(true);
    } else {
      setLoading(true);
    }

    if (!param.phone) {
      Reflect.deleteProperty(param, "nationalPhone");
    }
    try {
      const res = await api(param);
      if (res.code === 200) {
        toast.success(type === 1 ? MESSAGE.editinvitation : MESSAGE.edit, {
          position: "top-center",
        });
        if (type == 1) {
          // invite
          setInviteLoading(false);
        } else {
          setLoading(false);
        }
        setOpen(false);
        onClose();
        getLsit();
      }
    } finally {
      if (type == 1) {
        // invite
        setInviteLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const getRoleList = async (data: string) => {
    try {
      const res = await getworkerRoleSelect(data);
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

  const handleInvite = async () => {
    setInviteLoading(true);
    if (form.getValues("nationalPhone")) {
      const res = await messageValidatePhoneNumber4LineType(
        form.getValues("nationalPhone")?.replace(/\s+/g, "") || ""
      );

      if (res.code === 200) {
        if (
          res.data.valid &&
          res.data.lineTypeIntelligence?.type !== "landline"
        ) {
          let params = {
            ...form.getValues(),
            phone: res.data.phoneNumber.endpoint,
            nationalPhone:
              "+" + res.data.callingCountryCode + " " + res.data.nationalFormat,
          };
          if (editItem) {
            editTypeDictinaryFn(params, 1);
          } else {
            addTypeDictinaryFn(params, 1);
          }
        } else {
          form.setError("nationalPhone", {
            message: "Invalid phone number.",
          });
        }
      }
    } else {
      if (editItem) {
        editTypeDictinaryFn(form.getValues(), 1);
      } else {
        addTypeDictinaryFn(form.getValues(), 1);
      }
    }
  };
  const onsubmit = async (data: any) => {
    if (form.getValues("nationalPhone")) {
      try {
        const res = await messageValidatePhoneNumber4LineType(
          form.getValues("nationalPhone")?.replace(/\s+/g, "") || ""
        );
        if (res.code === 200) {
          if (
            res.data.valid &&
            res.data.lineTypeIntelligence?.type !== "landline"
          ) {
            let params = {
              ...data,
              phone: res.data.phoneNumber.endpoint,
              nationalPhone:
                "+" +
                res.data.callingCountryCode +
                " " +
                res.data.nationalFormat,
              id: editItem?.id,
            };
            if (editItem) {
              editTypeDictinaryFn(params, 2);
            } else {
              Reflect.deleteProperty(params, "id");
              addTypeDictinaryFn(params, 2);
            }
          } else {
            form.setError("nationalPhone", {
              message: "Invalid phone number.",
            });
          }
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (editItem) {
        let editObj = {
          ...data,
          id: editItem.id,
        };
        Reflect.deleteProperty(editObj, "nationalPhone");
        editTypeDictinaryFn(editObj, 2);
      } else {
        Reflect.deleteProperty(data, "nationalPhone");
        addTypeDictinaryFn(data, 2);
      }
    }
  };

  const handleSaveInvite = async () => {
    form.handleSubmit(handleInvite)();
  };

  const handleSave = async () => {
    ValidatePhoneNumber();
  };

  const ValidatePhoneNumber = async () => {
    if (form.getValues("nationalPhone")) {
      const res = await messageValidatePhoneNumber(
        form.getValues("nationalPhone")?.replace(/\s+/g, "") || ""
      );
      if (res.code === 200) {
        if (!res.data.valid) {
          form.setError("nationalPhone", {
            message: "Invalid phone number.",
          });
        }
      }
    }
  };

  const validEmail = () => {
    if (!validateEmail(form.getValues("email") || "")) {
      return "Invalid email address.";
    }
    return true;
  };
  const workerRoleIdsRef = useRef<any>(null);
  useEffect(() => {
    if (workerRoleIdsRef.current && isFocus) {
      workerRoleIdsRef.current.focus();
    }
  }, [isFocus, workerRoleIdsRef]);

  return (
    <CustomDialog
      title={editItem ? "Edit Employee" : "Add Employee"}
      open={open}
      width="860px"
      onClose={() => {
        onClose();
        setOpen(false);
      }}
    >
      <CustomForm
        form={form}
        className="py-4 px-6"
        onSubmit={(data) => {
          onsubmit(data);
        }}
      >
        <>
          <div className="text-[#324664] font-[390] text-[16px] mb-[10px]">
            Please enter either Email or Phone or both
            <span className="text-[#EB1DB2] ml-[5px]">*</span>
          </div>
          <div className="flex space-x-12 mb-[10px]">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <CustomFormItem label="First name" required>
                    <CustomInput
                      placeholder="First name"
                      {...field}
                      disabled={!!editItem?.firstName}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <CustomFormItem label="Last name" required>
                    <CustomInput
                      placeholder="Last name"
                      {...field}
                      disabled={!!editItem?.lastName}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
          </div>
          <div className="flex space-x-12 mb-[10px]">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <CustomFormItem label="Email Address">
                    <CustomInput
                      placeholder="Email Address"
                      {...field}
                      disabled={!!editItem?.email}
                    />
                  </CustomFormItem>
                )}
                rules={{
                  validate: validEmail,
                }}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="nationalPhone"
                render={({ field }) => (
                  <CustomFormItem label="Phone Number">
                    <CustomPhoneInput
                      setError={(message = "Invalid phone number.") => {
                        form.setError("nationalPhone", { message });
                      }}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        if (field.value?.length === 0) {
                          form.setError("nationalPhone", { message: "" });
                        }
                      }}
                      placeholder="Phone Number"
                      disabled={!!editItem?.nationalPhone}
                    ></CustomPhoneInput>
                  </CustomFormItem>
                )}
              />
            </div>
          </div>
          <div className="flex space-x-12 mb-[10px]">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="workerRoleIds"
                render={({ field }) => (
                  <CustomFormItem label="Roles Allowed to Work" required>
                    <Select
                      ref={workerRoleIdsRef}
                      options={workerRoleList}
                      value={field.value}
                      onChange={field.onChange}
                      isMulti
                      isWrap
                      placeholder="Roles Allowed to Work"
                    />
                  </CustomFormItem>
                )}
              />
            </div>
            <div className="flex-1"></div>
          </div>
        </>

        {/* edit */}
        <div className="flex gap-6 justify-end">
          <CustomButton
            onClick={() => {
              setOpen(false);
              onClose();
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </CustomButton>
          {!editItem ? (
            <CustomButton
              loading={loading}
              colorStyle="yellow"
              type="submit"
              onClick={handleSave}
            >
              Save
            </CustomButton>
          ) : editItem && editItem.status == 4 ? (
            <CustomButton
              loading={loading}
              colorStyle="yellow"
              type="submit"
              onClick={handleSave}
            >
              Save
            </CustomButton>
          ) : (
            <CustomButton loading={loading} type="submit" onClick={handleSave}>
              Save
            </CustomButton>
          )}
          {!editItem ? (
            <CustomButton
              loading={inviteLoading}
              type="button"
              onClick={handleSaveInvite}
            >
              Save & Invite
            </CustomButton>
          ) : currentBtn == "Pending" && editItem && editItem.status == 4 ? (
            <CustomButton
              loading={inviteLoading}
              type="button"
              onClick={handleSaveInvite}
            >
              Save & Invite
            </CustomButton>
          ) : (
            ""
          )}
        </div>
      </CustomForm>
    </CustomDialog>
  );
};
export default CreateDia;

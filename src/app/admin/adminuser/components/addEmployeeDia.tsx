import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";

import {
  addAdminUserAdmin,
  addAndInviteAdminUserAdmin,
} from "@/api/admin/adminuser";
import { getRoleListApi } from "@/api/admin/employees";
import AuthProvide from "@/components/custom/Auth";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import FixedSelect from "@/components/custom/Select/FixedSelect";
import { MESSAGE } from "@/constant/message";
import useAuthStore from "@/store/useAuthStore";

import { AddAdminUserParams } from "../../community/types";

interface AddEmployeeDiaProps {
  open: boolean;
  assignRoleData: AddAdminUserParams;
  onClose: (isAll: boolean) => void;
}
const AddEmployeeDia = (props: AddEmployeeDiaProps) => {
  const { open, assignRoleData, onClose } = props;
  console.log(assignRoleData);

  const { permission } = useAuthStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const [roleList, setRoleList] = useState([]);

  const [value, setValue] = useState<string[]>([]);

  const getRoleList = async (communityId: string) => {
    try {
      const res = await getRoleListApi(communityId);
      if (res.code === 200) {
        const result: { label: string; value: string }[] = res.data.map(
          (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          }
        );
        setRoleList(result as []);
      }
    } finally {
    }
  };

  useEffect(() => {
    if (assignRoleData.communityId) {
      getRoleList(assignRoleData.communityId);
    }
  }, [assignRoleData]);

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveAndInviteLoading, setSaveAndInviteLoading] = useState(false);

  const addAll = async () => {
    try {
      setSaveLoading(true);
      const params = {
        communityId: assignRoleData.communityId,
        email: assignRoleData.email,
        workerRoleIds: value,
        autoInvite: false,
      };
      const res = await addAdminUserAdmin({
        ...assignRoleData,
        workersInviteAO: params,
      });
      if (res.code === 200) {
        onClose(true);
        toast.success(MESSAGE.create);
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const addAllAndInvite = async () => {
    try {
      setSaveAndInviteLoading(true);
      const params = {
        communityId: assignRoleData.communityId,
        email: assignRoleData.email,
        workerRoleIds: value,
        autoInvite: true,
      };
      const res = await addAndInviteAdminUserAdmin({
        redirectUrl: location.origin,
        ...assignRoleData,
        workersInviteAO: params,
      });
      if (res.code === 200) {
        onClose(true);
        toast.success(MESSAGE.create);
      }
    } finally {
      setSaveAndInviteLoading(false);
    }
  };

  const save = (autoInvite: boolean) => {
    if (value.length === 0) {
      toast.warning("Please select a role.");
      setError(true);
      return;
    }

    if (!autoInvite) {
      addAll();
    } else {
      addAllAndInvite();
    }
  };

  const [error, setError] = useState(false);

  return (
    <CustomDialog
      title={"Assign Role"}
      width={600}
      open={open}
      onClose={() => {
        onClose(false);
      }}
    >
      <div className="overflow-hidden">
        <div className="px-1 ">
          <div
            className={"mr-4 leading-10 text-left font-[390] text-[#324664]"}
          >
            Roles Allowed to Work
            <span className="ml-[5px] font-[390] text-[16px] text-[var(--primary-color)]">
              *
            </span>
          </div>
          <FixedSelect
            className="w-full"
            isMulti
            isSearchable
            options={roleList}
            onChange={(e) => {
              setValue(e ? e : []);
              if (e && e.length > 0) {
                setError(false);
              } else {
                setError(true);
              }
            }}
            value={value}
          ></FixedSelect>
          {error && (
            <p
              className={
                "text-sm text-destructive text-primary pt-[6px] font-[400]"
              }
            >
              This field is required.
            </p>
          )}
        </div>
        <div className="flex gap-6 justify-end px-6 mt-4">
          <Button
            onClick={() => {
              onClose(true);
            }}
            variant="outline"
            type="button"
            disabled={saveAndInviteLoading || saveLoading}
          >
            Cancel
          </Button>
          <Button
            colorStyle={
              permission.includes("EMPLOYEE_MANAGEMENT_EDIT")
                ? "yellow"
                : undefined
            }
            disabled={saveAndInviteLoading}
            loading={saveLoading}
            type="submit"
            onClick={() => {
              save(false);
            }}
          >
            Save
          </Button>
          <AuthProvide permissionName={["EMPLOYEE_MANAGEMENT_EDIT"]}>
            <Button
              type="submit"
              onClick={() => {
                save(true);
              }}
              disabled={saveLoading}
              loading={saveAndInviteLoading}
            >
              Save & Invite
            </Button>
          </AuthProvide>
        </div>
      </div>
    </CustomDialog>
  );
};

export default AddEmployeeDia;

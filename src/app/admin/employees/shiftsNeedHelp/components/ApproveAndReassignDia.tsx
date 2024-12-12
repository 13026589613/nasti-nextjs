import { zodResolver } from "@hookform/resolvers/zod";
import { useSetState } from "ahooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getUserWorkerListRoleAll } from "@/api/user";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Select, { OptionType } from "@/components/custom/Select";
import { FormField } from "@/components/ui/form";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import sortListByKey from "@/utils/sortByKey";

/**
 * @description Form Props
 */
interface ApproveDiaProps {
  open: boolean;
  userId?: string;
  claimUserIds?: string[];
  departmentIds?: string;
  roleId?: string;
  onClose: () => void;
  onSuccessful: (employee: string) => Promise<boolean>;
}

/**
 * @description Form Dialog
 */
const ApproveAndReassignDia = (props: ApproveDiaProps) => {
  const {
    open,
    userId,
    departmentIds,
    roleId,
    claimUserIds,
    onClose,
    onSuccessful,
  } = props;

  const { communityId } = useGlobalCommunityId();

  const [selectsInfo, setSelectsInfo] = useSetState({
    employeeLoading: true,
    employeeOptions: [] as OptionType[],
  });

  const [loading, setLoading] = useState(false);

  const FormSchema = z.object({
    employee: z.string().min(1, {
      message: "This field is required.",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const { reset } = form;

  const loadGetUserWorkerList = () => {
    if (!communityId) {
      return;
    }
    let params: any = {
      communityId: communityId,
      departmentIds: departmentIds,
      roleId: roleId,
    };

    getUserWorkerListRoleAll(params)
      .then(({ code, data }) => {
        if (code !== 200) return;

        if (data)
          setSelectsInfo({
            employeeOptions: [
              ...sortListByKey(
                data
                  .filter((item) => {
                    return (
                      item.userId !== userId &&
                      !claimUserIds?.includes(item.userId)
                    );
                  })
                  .map((item) => {
                    return {
                      label: `${item.firstName} ${item.lastName}`,
                      value: item.userId,
                    };
                  })
              ),
            ],
          });
      })
      .finally(() =>
        setSelectsInfo({
          employeeLoading: false,
        })
      );
  };

  useEffect(() => {
    reset();
  }, [open]);

  useEffect(() => {
    loadGetUserWorkerList();
  }, [communityId, departmentIds]);

  const onSubmit = async () => {
    setLoading(true);
    try {
      let employee = form.getValues("employee");
      if (employee) {
        await onSuccessful(employee);
      } else {
        form.setError("employee", {
          message: "This field is required.",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  // Dialog Form
  return (
    <>
      <CustomDialog
        title={"Approve & Re-assign"}
        open={open}
        onClose={() => {
          onClose && onClose();
        }}
      >
        <CustomForm form={form} onSubmit={(data) => {}}>
          <FormField
            control={form.control}
            name="employee"
            render={({ field }) => (
              <CustomFormItem
                label="Employee"
                required
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <Select
                  isLoading={selectsInfo.employeeLoading}
                  options={selectsInfo.employeeOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    if (value) {
                      form.clearErrors("employee");
                    }
                  }}
                  placeholder="Employee"
                />
              </CustomFormItem>
            )}
          />
        </CustomForm>
        {/* Dialog Form Btn‘s */}
        <div className="flex gap-6 justify-end mt-5">
          <Button
            onClick={() => {
              onClose && onClose();
            }}
            variant="outline"
            loading={loading}
          >
            Cancel
          </Button>

          <Button loading={loading} onClick={onSubmit} type="submit">
            Save
          </Button>
        </div>
      </CustomDialog>
    </>
  );
};
export default ApproveAndReassignDia;

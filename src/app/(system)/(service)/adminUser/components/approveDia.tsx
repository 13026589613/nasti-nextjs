import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { checkAdminUser } from "@/api/adminUser";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import FormItemLabel from "@/components/custom/FormItemLabel";
import Input from "@/components/custom/Input";
import { FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE } from "@/constant/message";
import useUserStore from "@/store/useUserStore";

import { AdminUserVo } from "../types";
import SetPermissionDia from "./setPermissionDia";

/**
 * @description Form Props
 */
interface ApproveDiaProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  userInfo: AdminUserVo;
  refreshList: () => void;
}

/**
 * @description Form Dialog
 */
const ApproveDia = (props: ApproveDiaProps) => {
  const { open, userInfo, setOpen, refreshList } = props;

  const FormSchema = z.object({
    reason: z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      reason: "",
    },
  });

  const { reset } = form;

  const { operateCommunity } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleApprove = () => {
    setSetPermissionDiaOpen(true);
  };

  const handleReject = () => {
    let reason =
      form.getValues("reason") === "" ? null : form.getValues("reason");
    if (reason) {
      setOpenConfirm(true);
    } else {
      form.setError("reason", {
        message: "This field is required.",
      });
    }
  };

  const checkAdminUserFn = async () => {
    setLoading(true);
    const reason =
      form.getValues("reason") === "" ? null : form.getValues("reason");

    let params: any = {
      userId: userInfo.userId,
      type: 0,
      communityId: operateCommunity.id as string,
      reason,
    };

    try {
      const res = await checkAdminUser(params);
      if (res.code === 200) {
        refreshList();
        setOpen(false);
        setOpenConfirm(false);
        toast.success(MESSAGE.reject);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reset();
  }, [open]);
  // Dialog Form

  const [setPermissionDiaOpen, setSetPermissionDiaOpen] = useState(false);

  return (
    <>
      <CustomDialog
        title={"Approve/Reject User"}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <div className="h-[calc(100vh-250px)] overflow-hidden">
          <CustomForm
            className="px-1 h-[calc(100%-60px)] overflow-auto"
            form={form}
            onSubmit={(data) => {}}
          >
            {userInfo && (
              <>
                <FormItemLabel label={"First Name"}>
                  <Input value={userInfo.firstName} disabled></Input>
                </FormItemLabel>
                <FormItemLabel label={"Last Name"}>
                  <Input value={userInfo.lastName} disabled></Input>
                </FormItemLabel>
                <FormItemLabel label={"Email Address"}>
                  <Input value={userInfo.email} disabled></Input>
                </FormItemLabel>
                <FormItemLabel label={"Community"}>
                  <Input value={operateCommunity.name} disabled></Input>
                </FormItemLabel>
              </>
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <CustomFormItem
                  label="Comment"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <Textarea
                    {...field}
                    onChange={(value) => {
                      if (value.target.value?.trim()) {
                        form.clearErrors("reason");
                      }

                      field.onChange(value);
                    }}
                  ></Textarea>
                </CustomFormItem>
              )}
            />
          </CustomForm>
          {/* Dialog Form Btn‘s */}
          <div className="flex gap-6 justify-end mt-5">
            <Button onClick={handleReject} variant="outline">
              Reject
            </Button>

            <Button onClick={form.handleSubmit(handleApprove)} type="submit">
              Approve
            </Button>
          </div>
          <ConfirmDialog
            width="500px"
            btnLoading={loading}
            open={openConfirm}
            onClose={() => {
              setOpenConfirm(false);
            }}
            onOk={() => {
              checkAdminUserFn();
            }}
          >
            {`Are you sure you want to reject this user?`}
          </ConfirmDialog>
        </div>
      </CustomDialog>
      {setPermissionDiaOpen && (
        <SetPermissionDia
          open={setPermissionDiaOpen}
          userInfo={userInfo}
          reason={form.getValues("reason") ?? ""}
          onSuccess={() => {
            setOpen(false);
            setSetPermissionDiaOpen(false);
          }}
          back={() => {
            setSetPermissionDiaOpen(false);
          }}
          refreshList={refreshList}
        ></SetPermissionDia>
      )}
    </>
  );
};
export default ApproveDia;

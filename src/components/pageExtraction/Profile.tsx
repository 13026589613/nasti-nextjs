"use client";
import "react-advanced-cropper/dist/style.css";

import { useSetState } from "ahooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Cropper, CropperRef } from "react-advanced-cropper";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { getAdminUserInfo } from "@/api/adminUser";
import { getUserInfoApi } from "@/api/auth";
import {
  messageValidatePhoneNumber,
  messageValidatePhoneNumber4LineType,
} from "@/api/reports";
import { FileUpload } from "@/api/sys";
import { userEditUserInfo } from "@/api/user";
import { UserEditUserInfoReq } from "@/api/user/types";
import Button from "@/components/custom/Button";
import CustomPhoneInput from "@/components/custom/PhoneInput/phoneInput";
import Tooltip from "@/components/custom/Tooltip";
import { MESSAGE } from "@/constant/message";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import { cn } from "@/lib/utils";
import useUserStore from "@/store/useUserStore";
import { getImageFile } from "@/utils/getFileUrl";
import { validateEmail } from "@/utils/verifyValidity";
import AddIcon from "~/icons/AddIcon.svg";
import DeleteIcon from "~/icons/DeleteIcon.svg";

import ConfirmDialog from "../custom/Dialog/confirm";
import CustomInput from "../custom/Input";
import Spin from "../custom/Spin";
import Upload, { UploadRef } from "../custom/Upload";
import { FormItem, FormLabel } from "../FormComponent";
import PageTitle from "../PageTitle";
const Profile = () => {
  const router = useRouter();

  const { userCommunityRefId } = useGlobalCommunityId();

  const [loadings, setLoadings] = useSetState({
    pageLoading: true,
    submitLoading: false,
    avatarLoading: false,
  });

  const [cropperDialogInfo, setCropperDialogInfo] = useSetState({
    open: false,
    image: "",
    loading: false,
  });

  const cropperRef = useRef<CropperRef>(null);

  const uploadRef = useRef<UploadRef>(null);

  const {
    control,
    formState: { errors, isDirty, dirtyFields },
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    getValues,
    trigger,
  } = useForm<UserEditUserInfoReq>();

  const loadGetAdminUserInfo = () => {
    setLoadings({
      pageLoading: true,
    });

    getAdminUserInfo(userCommunityRefId).then(({ code, data }) => {
      if (code === 200) {
        setLoadings({
          pageLoading: false,
        });

        reset(data);
      }
    });
  };

  useEffect(() => {
    loadGetAdminUserInfo();
  }, [userCommunityRefId]);

  const handleUpload = async (file: any) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.type);

    if (file.name) formData.append("name", file.name);

    if (file.size / 1024 / 1024 > 5) {
      toast.warning(MESSAGE.fillLimit_5M, {
        position: "top-center",
      });

      return;
    }

    setCropperDialogInfo({
      loading: true,
    });

    FileUpload(formData)
      .then((res) => {
        if (res.code == 200 && res.data) {
          setValue("portraitFileId", res.data, {
            shouldDirty: true,
          });

          setCropperDialogInfo({
            open: false,
            image: "",
          });
        }
      })
      .finally(() => {
        setCropperDialogInfo({
          loading: false,
        });
      });
  };

  const onSubmit = async (formData: UserEditUserInfoReq) => {
    const {
      userId,
      communityId,
      firstName,
      lastName,
      email,
      title,
      portraitFileId,
    } = formData;

    try {
      setLoadings({
        submitLoading: true,
      });

      if (dirtyFields.nationalPhone) {
        // Free interface to verify if it is a qualified US cell phone number
        const messageValidateRes = await messageValidatePhoneNumber(
          formData.nationalPhone.replace(/\s+/g, "")
        );

        if (!messageValidateRes?.data?.valid) {
          setError("nationalPhone", {
            message: "Invalid phone number.",
          });
          return;
        }

        // Paid interface, check if this cell phone number can receive SMS messages
        const messageValidateRes2 = await messageValidatePhoneNumber4LineType(
          formData.nationalPhone.replace(/\s+/g, "")
        );

        if (
          !(
            messageValidateRes2?.data?.valid &&
            messageValidateRes2?.data?.lineTypeIntelligence?.type !== "landline"
          )
        ) {
          setError("nationalPhone", {
            message: "Invalid phone number.",
          });
          return;
        }

        setValue("phone", messageValidateRes2.data.phoneNumber.endpoint);
        setValue(
          "nationalPhone",
          "+" +
            messageValidateRes2.data.callingCountryCode +
            " " +
            messageValidateRes2.data.nationalFormat
        );
      }

      if (dirtyFields.email) {
      }

      const phone = getValues("phone");
      const nationalPhone = getValues("nationalPhone");

      const { code } = await userEditUserInfo({
        userId,
        communityId,
        firstName,
        lastName,
        email,
        phone,
        nationalPhone,
        title,
        portraitFileId: portraitFileId || null,
      });

      if (code === 200) {
        toast.success(MESSAGE.edit, {
          position: "top-center",
        });

        const res = await getUserInfoApi();

        if (res.code === 200) {
          useUserStore.getState().setUserInfo({
            id: res.data.id,
            email: res.data.email,
            phone: res.data.phone,
            isEnabled: res.data.isEnabled,
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            middleName: res.data.middleName,
            portraitFileId: res.data.portraitFileId,
            nationalPhone: res.data.nationalPhone,
          });
          reset({ ...res.data, title, userId, communityId });
        }
      }
    } finally {
      setLoadings({
        submitLoading: false,
      });
    }
  };

  const handleCrop = () => {
    const canvas = cropperRef.current?.getCanvas();

    if (canvas) {
      canvas.toBlob((blob) => {
        handleUpload(blob);
      }, "image/jpeg");
    }
  };

  const validEmail = (v: string) => {
    if (!validateEmail(v)) {
      return "Invalid email address.";
    }
    return true;
  };

  return (
    <Spin className="h-full relative pb-[90px]" loading={loadings.pageLoading}>
      <PageTitle title="Profile" isClose={false} />
      <div className="lg:flex">
        <FormLabel
          label="First Name"
          required
          className="lg:flex-1 lg:mr-[20px]"
        >
          <FormItem
            name="firstName"
            control={control}
            errors={errors.firstName}
            render={({ field: { value, onChange } }) => (
              <CustomInput
                placeholder="FirstName"
                value={value}
                onChange={onChange}
              />
            )}
            rules={{
              required: "This field is required.",
            }}
          />
        </FormLabel>

        <FormLabel label="Last Name" required className="lg:flex-1">
          <FormItem
            name="lastName"
            control={control}
            errors={errors.lastName}
            render={({ field: { value, onChange } }) => (
              <CustomInput
                placeholder="Last Name"
                value={value}
                onChange={onChange}
              />
            )}
            rules={{
              required: "This field is required.",
            }}
          />
        </FormLabel>
      </div>
      <div className="lg:flex">
        <FormLabel
          label="Email Address"
          required
          className="lg:flex-1 lg:mr-[20px]"
        >
          <FormItem
            name="email"
            control={control}
            errors={errors.email}
            render={({ field: { value, onChange } }) => (
              <CustomInput
                placeholder="Email Address"
                value={value}
                onChange={onChange}
              />
            )}
            rules={{
              required: "This field is required.",
              validate: validEmail,
            }}
          />
        </FormLabel>

        <FormLabel label="Phone Number" required className="lg:flex-1">
          <FormItem
            name="nationalPhone"
            control={control}
            errors={errors.nationalPhone}
            render={({ field: { value, onChange } }) => (
              <CustomPhoneInput
                setError={(message = "Invalid phone number.") => {
                  if (message) {
                    setError("nationalPhone", { message });
                  } else {
                    trigger("nationalPhone");
                  }
                }}
                placeholder="Phone Number"
                value={value}
                onChange={(v) => {
                  onChange(v);
                  if (value.length === 0) {
                    setError("nationalPhone", { message: "" });
                  }
                }}
              />
            )}
            rules={{
              required: "This field is required.",
            }}
          />
        </FormLabel>
      </div>
      <div className="lg:flex">
        <FormLabel
          label="Title"
          required
          className="lg:flex-1 lg:mr-[20px] justify-start"
        >
          <FormItem
            name="title"
            control={control}
            errors={errors.title}
            render={({ field: { value, onChange } }) => (
              <CustomInput
                placeholder="Title"
                value={value}
                onChange={onChange}
              />
            )}
            rules={{
              required: "This field is required.",
            }}
          />
        </FormLabel>

        <FormLabel
          label="Avatar"
          className="lg:flex-1 justify-start"
          extraRender={
            <div className="ml-[20px]">
              <Tooltip
                icon="help"
                content={
                  <div className="font-[390] text-[#324664] ">
                    <div>Supported image types: png, jpg, jpeg</div>
                    <div>Max size: 5M</div>
                  </div>
                }
              />
            </div>
          }
        >
          <Upload
            ref={uploadRef}
            accept="image/*"
            hide={!!watch("portraitFileId")}
            onChange={(event: any) => {
              const file = event.target.files[0];

              const webkitURL =
                window[window.webkitURL ? "webkitURL" : "URL"][
                  "createObjectURL"
                ];

              const imgSrc = webkitURL(file);

              setCropperDialogInfo({
                open: true,
                image: imgSrc,
              });
            }}
          />

          <Spin className="w-[140px]" loading={loadings.avatarLoading}>
            <div
              className={cn(
                "w-[140px] h-[140px] p-[10px] rounded-[4px] border-[#E4E4E7] border-[1px] group relative cursor-pointer hidden",
                !!watch("portraitFileId") && "block"
              )}
            >
              <Image
                src={getImageFile(watch("portraitFileId") + "")}
                width={130}
                height={130}
                loading="lazy"
                alt="noImage"
                style={{
                  pointerEvents: "none",
                }}
              />

              <div className="group-hover:block hidden absolute top-0 left-0 right-0 bottom-0 p-[10px]">
                {!loadings.avatarLoading && (
                  <div className="h-full w-full bg-[#00000073] flex justify-center items-center">
                    <div
                      onClick={() => {
                        uploadRef.current?.onManualUpload();
                      }}
                    >
                      <AddIcon
                        width="20px"
                        height="20px"
                        className="mr-[20px]"
                        color="#fff"
                      />
                    </div>

                    <div
                      onClick={() => {
                        setValue("portraitFileId", "", {
                          shouldDirty: true,
                        });
                      }}
                    >
                      <DeleteIcon width="20px" height="20px" color="red" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Spin>
        </FormLabel>
      </div>
      <div className="absolute bottom-[30px] right-[30px] flex justify-end">
        <Button
          className="mr-[20px] w-[160px]"
          type="button"
          disabled={loadings.submitLoading}
          variant="outline"
          onClick={() => {
            router.back();
          }}
        >
          Cancel
        </Button>

        <Button
          className="w-[160px]"
          type="button"
          disabled={!isDirty}
          loading={loadings.submitLoading}
          onClick={handleSubmit(onSubmit)}
        >
          Save
        </Button>
      </div>

      <ConfirmDialog
        title=""
        btnLoading={cropperDialogInfo.loading}
        open={cropperDialogInfo.open}
        onClose={() => {
          setCropperDialogInfo({
            open: false,
            image: "",
          });
        }}
        okText="Choose"
        onOk={handleCrop}
      >
        <div className="w-full h-[540px]">
          <Cropper
            ref={cropperRef}
            src={cropperDialogInfo.image}
            className={"cropper"}
            stencilProps={{
              aspectRatio: 1,
            }}
          />
        </div>
      </ConfirmDialog>
    </Spin>
  );
};

export default Profile;

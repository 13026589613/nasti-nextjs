"use client";
import { cloneDeep } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";

import { updateInfo4Invite } from "@/api/adminUser/index";
import { joinCommunityApi, signUpApi, signUpInviteApi } from "@/api/auth";
import { getCommunityList, getCompanyListPub } from "@/api/community";
import {
  messageValidatePhoneNumber,
  messageValidatePhoneNumber4LineType,
} from "@/api/reports";
import AddSelect from "@/components/custom/AddSelect";
import Button from "@/components/custom/Button";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import Input from "@/components/custom/Input";
import CustomPhoneInput from "@/components/custom/PhoneInput/phoneInput";
import { FormField } from "@/components/ui/form";
import { MESSAGE } from "@/constant/message";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";
import useDepartmentStore from "@/store/useDepartmentStore";
import useTokenStore from "@/store/useTokenStore";
import useUserStore from "@/store/useUserStore";

import { SignUpParams } from "../../types";
import useRegisterFormHookCreate, {
  InfoFormType,
} from "../hooks/RegisterFormHook";
import { PasswordData, RegisterInfoLessData } from "../types";

interface RegisterInfoLessFormProps {
  passwordData: PasswordData | null;
  registerInfoLess: RegisterInfoLessData | null;
  registerAgain: boolean;
  setRegisterInfoLess: (data: RegisterInfoLessData | null) => void;
  setType: (type: "email" | "password" | "info") => void;
  handleSubmit: (data: RegisterInfoLessData, success: boolean) => void;
}

interface List {
  label: string;
  value: string;
  __isNew__?: boolean;
}
const RegisterInfoLessForm = (props: RegisterInfoLessFormProps) => {
  const params = useSearchParams();
  const code = params.get("tokenId");
  const type = params.get("type");

  const {
    passwordData,
    registerInfoLess,
    registerAgain,
    setRegisterInfoLess,
    setType,
    handleSubmit,
  } = props;

  const [loading, setLoading] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const [communityList, setCommunityList] = useState<List[]>([]);

  const { form } = useRegisterFormHookCreate({
    type: "info",
  });

  const router = useRouter();

  const { userInfo } = useUserStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  useEffect(() => {
    if (isOpen && divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [isOpen]);

  const [companyList, setCompanyList] = useState<List[]>([]);

  const [originalCommunity, setOriginalCommunity] = useState<
    {
      id: string;
      name: string;
      companyId: string;
    }[]
  >([]);

  const companyId = form.watch("companyId");
  const communityId = form.watch("communityId");

  const previous = () => {
    setType("password");
    setRegisterInfoLess(form.getValues() as RegisterInfoLessData);
  };

  const signUpApiFn = async (
    data: SignUpParams,
    newCommunity: string,
    newCompany: string
  ) => {
    setLoading(true);
    try {
      if (code !== "isOnboarding" && !registerAgain) {
        if (passwordData) {
          data.password = passwordData.password;

          const res = await signUpApi(data);
          if (res.code === 200) {
            useUserStore.getState().setIsOnboarding(false);
            useTokenStore.setState({ accessToken: res.data.token });
            if (newCommunity) {
              useAppStore.getState().reSetAppStore();
              useDepartmentStore.getState().resetStore();
              router.replace(
                `/onboarding/community?newCommunity=${newCommunity}&newCompany=${newCompany}&title=${data.title}`
              );
            } else {
              handleSubmit(form.getValues(), true); // tap into the success callback to redirect to onboarding
              // setDeleteDialogOpen(true);
              toast.success("Request sent successfully.", {
                position: "top-center",
              });
            }
          }
        }
      } else {
        if (newCommunity) {
          useAppStore.getState().reSetAppStore();
          useDepartmentStore.getState().resetStore();
          router.replace(
            `/onboarding/community?newCommunity=${newCommunity}&newCompany=${newCompany}&title=${data.title}`
          );
        } else {
          joinCommunity(data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpInviteApiFn = async (data: SignUpParams) => {
    setLoading(true);
    try {
      if (passwordData) {
        data.password = passwordData.password;
      }
      const res = await signUpInviteApi(data);
      if (res.code === 200) {
        useTokenStore.setState({ accessToken: res.data.token });
        toast.success(MESSAGE.signUp, { position: "top-center" });
        router.replace("/myCommunity");
      }
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async (data: SignUpParams) => {
    setLoading(true);
    try {
      const res = await joinCommunityApi(data);
      if (res.code === 200) {
        handleSubmit(form.getValues(), true); // tap into the success callback to redirect to onboarding
        toast.success(MESSAGE.waitingForApproval, { position: "top-center" });
      }
    } finally {
      setLoading(false);
    }
  };

  const submit = async (
    data: Omit<InfoFormType, "communityId"> & { communityId?: string }
  ) => {
    try {
      setLoading(true);
      const res = await messageValidatePhoneNumber4LineType(
        form.getValues("nationalPhone").replace(/\s+/g, "")
      );
      if (res.code === 200) {
        if (
          res.data.valid &&
          res.data.lineTypeIntelligence?.type !== "landline"
        ) {
          let params: any = {};
          let newCommunity = "";
          let newCompany = "";
          params = {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: res.data.phoneNumber.endpoint,
            title: data.title,
            tokenId: code,
            nationalPhone:
              "+" + res.data.callingCountryCode + " " + res.data.nationalFormat,
          };
          if (data.communityId) {
            const community = communityList.find((item) => {
              return item.value === data.communityId;
            });
            if (community && !community.__isNew__) {
              params.communityId = data.communityId;
            } else {
              newCompany = data.companyId;
              newCommunity = data.communityId;
            }
          }
          let paramsCopy = cloneDeep(params);
          Reflect.deleteProperty(paramsCopy, "tokenId");

          if (type === "INVITE") {
            signUpInviteApiFn(params);
          } else {
            if (code === "isOnboarding") {
              const Res = await updateInfo4Invite(paramsCopy);
              if (Res.code === 200 && Res.data) {
                signUpApiFn(params, newCommunity, newCompany);
              } else {
                setLoading(false);
              }
            } else {
              signUpApiFn(params, newCommunity, newCompany);
            }
          }
        } else {
          form.setError("nationalPhone", { message: "Invalid phone number." });
        }
      } else {
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCommunityListFn = async (companyId?: string) => {
    const res = await getCommunityList(companyId);
    if (res.code === 200) {
      const community = communityList.find(
        (item) => item.value === communityId
      );
      if (community && !community.__isNew__) {
        setCommunityList(
          res.data.map((item) => ({ label: item.name, value: item.id }))
        );
      } else {
        if (communityId) {
          setCommunityList([
            { label: communityId, value: communityId, __isNew__: true },
            ...res.data.map((item) => ({ label: item.name, value: item.id })),
          ]);
        } else {
          setCommunityList([
            ...res.data.map((item) => ({ label: item.name, value: item.id })),
          ]);
        }
      }

      setOriginalCommunity(res.data);
    }
  };

  const getCompanyListFn = async () => {
    const res = await getCompanyListPub();
    if (res.code === 200) {
      setCompanyList(
        res.data.map((item) => ({ label: item.name, value: item.id }))
      );
    }
  };

  useEffect(() => {
    if (companyId) {
      const company = companyList.find((item) => {
        return item.value === companyId;
      });
      if (company && !company.__isNew__) {
        getCommunityListFn(companyId);
      } else {
        const community = communityList.find((item) => {
          return item.value === communityId;
        });
        if (!community) {
          setCommunityList([]);
        } else {
          if (community && !community.__isNew__) {
            setCommunityList([]);
          } else {
            setCommunityList([
              {
                label: communityId,
                value: communityId,
                __isNew__: true,
              },
            ]);
          }
        }
      }
    } else {
      if (type !== "INVITE") {
        getCommunityListFn();
      }
    }
  }, [companyId]);

  useEffect(() => {
    if (communityId) {
      const community = communityList.find(
        (item) => item.value === communityId
      );
      const communityOriginal = originalCommunity.find((item) => {
        return item.id === communityId;
      });
      if (community && !community.__isNew__ && communityOriginal) {
        form.setValue("companyId", communityOriginal.companyId);
      }
    } else {
      let community = communityList.filter(
        (item) => item.label && item.label === item.value
      );
      if (community.length === 0) {
        form.setValue("companyId", "");
      }
    }
  }, [communityId]);

  useEffect(() => {
    if (type !== "INVITE") {
      getCommunityListFn();
      getCompanyListFn();
    }

    if (code === "isOnboarding" && userInfo) {
      form.reset({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        phone: userInfo.phone,
        nationalPhone: userInfo.nationalPhone,
        title: "",
      });
    }
  }, []);

  useEffect(() => {
    if (registerInfoLess) {
      form.reset({
        ...registerInfoLess,
      });
    }
  }, [registerInfoLess]);

  useEffect(() => {
    if (isOpen && divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [isOpen]);

  return (
    <CustomForm form={form} onSubmit={submit}>
      <div className="overflow-auto h-[calc(100vh-290px)]" ref={divRef}>
        <div className="w-full px-4 pb-10 space-y-5">
          <FormField
            control={form.control as any}
            name="firstName"
            render={({ field }) => (
              <CustomFormItem
                label={"First Name"}
                formMessageClassName="absolute"
                required
              >
                <div className={cn("w-full")}>
                  <Input className="h-10" placeholder="First Name" {...field} />
                </div>
              </CustomFormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="lastName"
            render={({ field }) => (
              <CustomFormItem
                label={"Last Name"}
                formMessageClassName="absolute"
                required
              >
                <div className={cn("w-full")}>
                  <Input className="h-10" placeholder="Last Name" {...field} />
                </div>
              </CustomFormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="nationalPhone"
            render={({ field }) => (
              <CustomFormItem
                label={"Phone Number"}
                formMessageClassName="absolute"
                required
              >
                <div className={cn("w-full")}>
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
                  ></CustomPhoneInput>
                </div>
              </CustomFormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="title"
            render={({ field }) => (
              <CustomFormItem
                label={"Title"}
                formMessageClassName="absolute"
                required
              >
                <div className={cn("w-full")}>
                  <Input className="h-10" placeholder="Title" {...field} />
                </div>
              </CustomFormItem>
            )}
          />
          {type !== "INVITE" && (
            <>
              <FormField
                control={form.control as any}
                name="communityId"
                render={({ field }) => {
                  let value = field.value;
                  let obj: any = {};
                  if (value) {
                    communityList.forEach((item) => {
                      if (item.value === value) {
                        obj = item;
                      }
                    });
                  } else {
                    obj = null;
                  }
                  return (
                    <CustomFormItem label={"Community"} required>
                      <div className={cn("w-full")}>
                        <AddSelect
                          label="Community"
                          placeholder="Choose community to join or add new"
                          isSearchable
                          isClearable
                          menuPlacement="bottom"
                          options={communityList}
                          setOptions={setCommunityList}
                          onChange={(opt) => {
                            if (opt) {
                              field.onChange({
                                target: {
                                  value: opt.value,
                                },
                              });
                            } else {
                              field.onChange({
                                target: {
                                  value: "",
                                },
                              });
                            }
                          }}
                          value={obj}
                          onMenuOpen={() => {
                            setIsOpen(true);
                          }}
                          onMenuClose={() => {
                            setIsOpen(false);
                          }}
                        ></AddSelect>
                      </div>
                    </CustomFormItem>
                  );
                }}
              />
              <FormField
                control={form.control as any}
                name="companyId"
                render={({ field }) => {
                  let value = field.value;
                  let obj: any = {};

                  if (value) {
                    companyList.forEach((item) => {
                      if (item.value === value) {
                        obj = item;
                      }
                    });
                  } else {
                    obj = null;
                  }
                  let isDisabled = false;
                  const community = communityList.find(
                    (item) => item.value === communityId
                  );

                  if (community && !community.__isNew__) {
                    isDisabled = true;
                  }

                  return (
                    <CustomFormItem label={"Company"} required>
                      <div className={cn("w-full")}>
                        <AddSelect
                          label="Company"
                          isClearable
                          isDisabled={isDisabled}
                          placeholder="Choose company to join or add new"
                          isSearchable
                          menuPlacement="bottom"
                          options={companyList}
                          setOptions={setCompanyList}
                          onChange={(opt) => {
                            if (opt) {
                              field.onChange({
                                target: {
                                  value: opt.value,
                                },
                              });
                            } else {
                              field.onChange({
                                target: {
                                  value: "",
                                },
                              });
                            }
                          }}
                          value={obj}
                          onMenuOpen={() => {
                            setIsOpen(true);
                          }}
                          onMenuClose={() => {
                            setIsOpen(false);
                          }}
                        ></AddSelect>
                      </div>
                    </CustomFormItem>
                  );
                }}
              />
            </>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-5 mt-[31px]">
        {code !== "isOnboarding" && (
          <Button
            onClick={previous}
            type="button"
            variant="ghost"
            className="text-[#F5894E] text-[16px] leading-10 h-12"
          >
            Previous
          </Button>
        )}
        <Button
          variant="default"
          className="w-[149px] h-[48px] font-[390] text-[16px]"
          loading={loading}
          type="submit"
          onClick={async () => {
            if (form.getValues("nationalPhone")) {
              const res = await messageValidatePhoneNumber(
                form.getValues("nationalPhone").replace(/\s+/g, "")
              );
              if (res.code === 200) {
                if (!res.data.valid) {
                  form.setError("nationalPhone", {
                    message: "Invalid phone number.",
                  });
                }
              }
            }
          }}
        >
          Save
        </Button>
      </div>
    </CustomForm>
  );
};
export default RegisterInfoLessForm;

"use client";
import "./style.css";

import { useUpdateEffect } from "ahooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { useShallow } from "zustand/react/shallow";

import { addCommunity, editCommunity } from "@/api/admin/community";
import { CommunityVo } from "@/api/admin/community/type";
import {
  getCommunityInfo,
  getCompanyList,
  getDataByCode,
  getRegionsList,
  getTimeZone,
} from "@/api/community";
import { getTimeZoneByLocation } from "@/api/sys";
import { FileUpload, getFileInfo } from "@/api/sys";
import AddSelect from "@/components/custom/AddSelect";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import CustomForm from "@/components/custom/Form";
import CustomFormItem from "@/components/custom/Form/FormItem";
import CustomInput from "@/components/custom/Input";
import Select from "@/components/custom/Select";
import Tooltip from "@/components/custom/Tooltip";
import Upload from "@/components/custom/Upload";
import { FormField } from "@/components/ui/form";
import { GOOGLE_KEY } from "@/constant/googlekey";
import { WEEK_DATA_FOR_SELECT, YES_NO_LIST } from "@/constant/listOption";
import { MESSAGE } from "@/constant/message";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/useAppStore";
import useAuthStore from "@/store/useAuthStore";
import AddIcon from "~/icons/AddIcon.svg";
import DeleteIcon from "~/icons/DeleteIcon.svg";

import { AddCommunityInput, EditCommunityInput } from "../../types";
import CommunityButton from "../communityButton";
import GoogleMap from "../googleMap";
import TitleBlock from "../titleBlock";
import useFormCreate, { AddressInfoType, FormType } from "./hooks/form";

interface CommunitiyInfoProps {
  editItem: CommunityVo | null;
  communityId: string | undefined;
  buttonClassName?: string;
  isEdit?: boolean;
  setOpen?: () => void;
}

interface List {
  label: string;
  value: string;
  __isNew__?: boolean;
}

export default function CommunityInfo({
  communityId,
  isEdit = false,
  buttonClassName,
  setOpen,
}: CommunitiyInfoProps) {
  const uuid = uuidv4();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { permission } = useAuthStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const { form } = useFormCreate({});
  const [isOver, setIsOver] = useState(false);
  const [imgSrc, setImgSrc] = useState("");

  const [stateList, setStateList] = useState([]);
  const [timeZoneOptions, setTimeZoneOptions] = useState<
    { value: string; label: string; zoneId: string }[]
  >([]);
  const [buildingTypeList, setBuildingTypeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileId, setFileId] = useState<string>("");
  const [companyList, setCompanyList] = useState<List[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);

  const [confirmDia, setConfirmDia] = useState(false);

  const [startDayReadOnly, setStartDayReadOnly] = useState<boolean>(false);

  const physicalAddress = form.getValues("physicalAddress");
  const physicalCity = form.getValues("physicalCity");
  const getCommunityInfoFn = async () => {
    const res = await getCommunityInfo(communityId || "");
    if (res.code == 200) {
      const data = res.data;
      form.reset({
        name: data.name,
        companyId: data.companyId,
        buildingTypeList: data.buildingTypeList,
        logoFileId: data.logoFileId,
        physicalAddress: data.physicalAddress,
        physicalCity: data.physicalCity,
        physicalState: data.physicalState,
        physicalZip: data.physicalZip,
        mailingAddress: data.mailingAddress,
        mailingAddress2: data.mailingAddress2 ? data.mailingAddress2 : "",
        mailingCity: data.mailingCity,
        mailingState: data.mailingState,
        mailingZip: data.mailingZip,
        billingContact: data.billingContact,
        billingEmail: data.billingEmail,
        attendanceEnabled: data.attendanceEnabled,
        startOfWeek: data.startOfWeek,
        timeZoneId: data.timeZoneId,
      });
      setStartDayReadOnly(data.startDayReadOnly);

      const address = await mapRef.current?.getAddressByLatLng(
        data.locationLat,
        data.locationLng
      );

      setMapAddressInfo(address);

      setTimeout(async () => {
        const index: number = stateList.findIndex(
          (item: any) => item.value === data.physicalState
        );

        const addressInfo =
          data.physicalAddress +
          "," +
          data.physicalCity +
          "," +
          (index >= 0 ? (stateList[index] as any).label : "");

        const address: AddressInfoType =
          await mapRef.current?.getAddressByAddress(addressInfo);

        setMapAddressInfo(address);

        if (data.logoFileId) {
          getFileDetails(data.logoFileId);
        }
      }, 200);
    }
  };

  const getTimeZoneFn = async () => {
    const res = await getTimeZone();
    if (res.code == 200) {
      const arr = res.data.map((item: any) => {
        return {
          label: item.displayName,
          value: item.id,
          zoneId: item.zoneId,
        };
      }) as [];
      setTimeZoneOptions(arr);
    }
  };

  const [initLoading, setInitLoading] = useState(true);

  const init = async () => {
    setInitLoading(true);
    Promise.all([
      getRegionsSelect(),
      getBuildingTypeList(),
      getCompanyData(),
      getTimeZoneFn(),
    ])
      .then(async () => {
        if (communityId) {
          await getCommunityInfoFn();
        }
      })
      .finally(() => {
        setInitLoading(false);
      });
  };

  useEffect(() => {
    init();
  }, []);

  useUpdateEffect(() => {
    init();
  }, [communityId]);

  useEffect(() => {
    // tbd-load img
    const imageUrl = window.localStorage.getItem("UPLOAD_IMG");
    if (imageUrl !== "undefined" && imageUrl) {
      setImgSrc(imageUrl);
    }
    const newCommunity = searchParams.get("newCommunity");

    if (newCommunity) {
      form.setValue("name", newCommunity);
    }

    if (pathname === "/myCommunity") {
      if (permission.includes("COMMUNITY_MANAGEMENT_EDIT")) {
        setIsDisabled(false);
      } else {
        setIsDisabled(true);
      }
    } else {
      setIsDisabled(false);
    }
  }, []);

  function handleCopy() {
    if (isDisabled) {
      return;
    }
    const {
      physicalAddress,
      mailingAddress2,
      physicalCity,
      physicalState,
      physicalZip,
    } = form.getValues();

    form.setValue("mailingAddress", physicalAddress);
    form.setValue("mailingAddress2", mailingAddress2);
    form.setValue("mailingCity", physicalCity);
    form.setValue("mailingState", physicalState);
    form.setValue("mailingZip", physicalZip || "");
  }

  function handleImgClick() {
    if (!isDisabled) {
      document.getElementById("imgFile")?.click();
    }
  }
  const linkHtml = (
    <div>
      <div
        onClick={() => handleCopy()}
        className="text-[var(--primary-color)] font-[390] text-[16px] cursor-pointer underline decoration-[var(--primary-color)]"
      >
        Copy from Physical Address
      </div>
    </div>
  );
  const getRegionsSelect = async () => {
    const res = await getRegionsList({
      type: 1,
    });
    if (res.code == 200) {
      const arr = res.data.map((item: any) => {
        return {
          label: item.name,
          value: item.id,
        };
      }) as [];
      setStateList(arr);
    }
  };
  const getBuildingTypeList = async () => {
    const res = await getDataByCode("BUILDING_TYPE");
    if (res.code == 200) {
      const arr = res.data.map((item: any) => {
        return {
          label: item.value,
          value: item.key,
        };
      }) as [];
      setBuildingTypeList(arr);
    }
  };

  const getCompanyData = async () => {
    const res = await getCompanyList("");
    if (res.code == 200) {
      const arr: List[] = res.data.map((item: any) => {
        return {
          label: item.value,
          value: item.key,
        };
      }) as [];
      const newCompany = searchParams.get("newCompany");

      if (newCompany) {
        const company = arr.find(
          (item: { value: string }) => item.value === newCompany
        );
        if (!company) {
          arr.push({
            label: newCompany,
            value: newCompany,
            __isNew__: true,
          });
        }
        form.setValue("companyId", newCompany);
      }
      setCompanyList(arr);
    }
  };

  function handleLogoDel() {
    setImgSrc("");
  }

  async function handlePhysicalState(value: any) {
    const index: number = stateList.findIndex(
      (item: any) => item.value === value
    );
    const address: string =
      physicalAddress +
      "," +
      physicalCity +
      "," +
      (index >= 0 ? (stateList[index] as any).label : "");

    if (value !== guessAddress?.physicalState) {
      const nowAddress = await mapRef.current?.getAddressByAddress(address);

      setGuessAddress(nowAddress);

      setIsConfirmAddress(false);
    }
  }

  async function handleCity(e: any) {
    if (e.target.value != guessAddress?.physicalCity) {
      const nowAddress = await mapRef.current?.getAddressByAddress(
        physicalAddress + "," + e.target.value
      );

      setGuessAddress(nowAddress);
      setIsConfirmAddress(false);
    }
  }

  async function handleAddress(e: any) {
    if (e.target.value != guessAddress?.physicalAddress) {
      const nowAddress = await mapRef.current?.getAddressByAddress(
        e.target.value + "," + physicalCity
      );

      setGuessAddress(nowAddress);
      setIsConfirmAddress(false);
    }
  }

  const getFileDetails = async (params: string) => {
    try {
      const res = await getFileInfo(params);
      if (res.code == 200 && res.data) {
        setImgSrc(res.data);
      }
    } finally {
    }
  };

  const handleGetTimeZoneByLocation = async (lat: number, lng: number) => {
    try {
      const { status, data } = await getTimeZoneByLocation({
        location: [lat, lng].join(","),
        key: GOOGLE_KEY,
        timestamp: Math.round(new Date().getTime() / 1000).toString(),
      });
      if (status !== 200) return;

      const list = timeZoneOptions.filter(
        (item) => item.zoneId === data.timeZoneId
      );
      if (list.length) {
        form.setValue("timeZoneId", list[0].value);
      }
    } catch (error) {}
  };

  const addCommunityFn = async (params: AddCommunityInput) => {
    try {
      const res = await addCommunity(params);
      if (res.code == 200) {
        toast.success(MESSAGE.save);
        useAppStore.getState().setIsRefreshCommunity(true);
        setOpen?.();
      }
    } finally {
      setLoading(false);
    }
  };
  const editCommunityFn = async (params: EditCommunityInput) => {
    try {
      const res = await editCommunity(params);
      if (res.code == 200) {
        toast.success(MESSAGE.save);
        useAppStore.getState().setIsRefreshCommunity(true);
        setOpen?.();
      }
    } finally {
      setLoading(false);
    }
  };

  async function handleSubmit(data: FormType) {
    setLoading(true);
    if (!mapAddressInfo?.lat || !mapAddressInfo?.lng) {
      toast.error(MESSAGE.locationSelectError_map, {
        position: "top-center",
      });
      setLoading(false);
      return;
    }
    let newCompanyName = data.companyId;
    companyList.forEach((item) => {
      if (item.value === data.companyId) {
        newCompanyName = "";
        if (item.__isNew__) {
          newCompanyName = item.value;
        }
      }
    });

    const params: AddCommunityInput = {
      companyId: newCompanyName ? uuid : data.companyId,
      newCompanyName: newCompanyName,
      name: data.name,
      startOfWeek: data.startOfWeek,
      physicalAddress: data.physicalAddress,
      physicalCity: data.physicalCity,
      physicalState: data.physicalState,
      physicalZip: data.physicalZip ? data.physicalZip : "",
      mailingAddress: data.mailingAddress,
      mailingAddress2: data.mailingAddress2,
      mailingCity: data.mailingCity,
      mailingState: data.mailingState ? data.mailingState : "",
      mailingZip: data.mailingZip,
      billingContact: data.billingContact,
      billingEmail: data.billingEmail ? data.billingEmail : "",
      logoFileId: fileId,
      locationLat: mapAddressInfo?.lat,
      locationLng: mapAddressInfo?.lng,
      buildingTypeList: data.buildingTypeList,
      attendanceEnabled: data.attendanceEnabled,
      timeZoneId: data.timeZoneId,
      addType: pathname === "/onboarding/community" ? "ON_BOARDING" : "CREATE",
    };
    if (!communityId) {
      addCommunityFn(params);
    } else {
      editCommunityFn({
        ...params,
        id: communityId,
      });
    }
  }

  // upload file
  const handleUpload = async (file: any) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.type);
    formData.append("name", file.name);

    if (file.size / 1024 / 1024 > 5) {
      toast.warning(MESSAGE.fillLimit_5M, {
        position: "top-center",
      });

      return;
    }

    FileUpload(formData).then((res) => {
      if (res.code == 200 && res.data) {
        setFileId(res.data);
      }
    });
  };

  const [mapAddressInfo, setMapAddressInfo] = useState<AddressInfoType>();
  const [guessAddress, setGuessAddress] = useState<AddressInfoType>();
  const [isConfirmAddress, setIsConfirmAddress] = useState(true);
  const mapRef = useRef<any>(null);

  return (
    <div className={cn("h-full w-full overflow-auto")}>
      <CustomForm
        form={form}
        className="pt-4 pb-10 px-6  flex-1"
        onSubmit={(data) => {
          if (!isConfirmAddress) {
            setConfirmDia(true);
          } else {
            handleSubmit(data);
          }
        }}
      >
        <TitleBlock title="Basic Info" className="mt-[16px]">
          <div className="flex space-x-12 mb-[10px]">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <CustomFormItem label="Community Name" required>
                    <CustomInput
                      disabled={isDisabled}
                      placeholder="Community Name"
                      {...field}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => {
                  let value = field.value;
                  let obj: any = null;
                  companyList.forEach((item) => {
                    if (item.value === value && value !== "" && value != null) {
                      obj = item;
                    }
                  });
                  return (
                    <CustomFormItem label="Company Name" required>
                      <AddSelect
                        label="Company Name"
                        isClearable
                        // isAdd={false}
                        isDisabled={isDisabled}
                        placeholder="Company Name"
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
                      ></AddSelect>
                    </CustomFormItem>
                  );
                }}
              />
            </div>
          </div>
          <div className="flex space-x-12">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="buildingTypeList"
                render={({ field }) => (
                  <CustomFormItem label="Building Type" required>
                    <Select
                      classNamePrefix="placeholder:text-red-900 placeholder:font-bold"
                      placeholder="Building Type"
                      options={buildingTypeList}
                      value={field.value}
                      isMulti
                      isWrap
                      isDisabled={isDisabled}
                      onChange={field.onChange}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
            <div className="relative flex-1">
              <FormField
                control={form.control}
                name="logoFileId"
                render={({ field }) => (
                  <CustomFormItem label="Community Logo">
                    {imgSrc ? (
                      <div
                        className="relative cursor-pointer w-[132px]  rounded border border-[#E4E4E7]"
                        onClick={handleImgClick}
                        onMouseEnter={(e) => {
                          if (!isDisabled) {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsOver(true);
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDisabled) {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsOver(false);
                          }
                        }}
                      >
                        <div className="h-full p-[8px] flex justify-center items-center">
                          <div className="h-full overflow-hidden">
                            {imgSrc && (
                              <Image
                                className="h-full"
                                src={imgSrc}
                                width={114}
                                height={92}
                                layout="intrinsic"
                                alt="noImage"
                              />
                            )}
                          </div>
                        </div>
                        <input
                          className="hidden"
                          id="imgFile"
                          type="file"
                          accept="image/png,jpg,jpeg"
                          onChange={(event: any) => {
                            const file = event.target.files[0];
                            const webkitURL =
                              window[window.webkitURL ? "webkitURL" : "URL"][
                                "createObjectURL"
                              ];
                            const imgSrc = webkitURL(file);
                            setImgSrc(imgSrc);
                            handleUpload(file); // upload file
                            field.onChange({
                              target: {
                                value: imgSrc,
                              },
                            });
                          }}
                        />
                        {isOver && (
                          <>
                            <div
                              style={{
                                background: "#000",
                                opacity: 0.3,
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                position: "absolute",
                              }}
                            />
                            <div className="flex justify-center items-center absolute left-0 top-0 bottom-0 right-0 m-auto">
                              <AddIcon
                                width="20px"
                                height="20px"
                                className="mr-2"
                                color="#fff"
                              />

                              <div
                                className="ml-2"
                                onClick={(e) => {
                                  handleLogoDel();
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <DeleteIcon
                                  width="20px"
                                  height="20px"
                                  color="red"
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <Upload
                        accept="image/*"
                        disabled={isDisabled}
                        onChange={(event: any) => {
                          const file = event.target.files[0];
                          const webkitURL =
                            window[window.webkitURL ? "webkitURL" : "URL"][
                              "createObjectURL"
                            ];
                          const imgSrc = webkitURL(file);
                          setImgSrc(imgSrc);
                          handleUpload(file); // upload file

                          field.onChange({
                            target: {
                              value: imgSrc,
                            },
                          });
                        }}
                      />
                    )}
                  </CustomFormItem>
                )}
              />

              <div className="absolute top-[9px] left-[130px]">
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
            </div>
          </div>
        </TitleBlock>
        <TitleBlock title="Physical Address">
          <div className="flex space-x-12 mb-[10px]">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="physicalAddress"
                render={({ field }) => (
                  <CustomFormItem label="Address" required>
                    <CustomInput
                      placeholder="Address"
                      {...field}
                      onBlur={handleAddress}
                      disabled={isDisabled}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="physicalCity"
                render={({ field }) => (
                  <CustomFormItem label="City" required>
                    <CustomInput
                      placeholder="City"
                      {...field}
                      onBlur={handleCity}
                      disabled={isDisabled}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
          </div>
          <div className="flex space-x-12">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="physicalState"
                render={({ field }) => (
                  <CustomFormItem label="State" required>
                    <Select
                      options={stateList}
                      value={field.value}
                      onChange={(value: any) => {
                        field.onChange(value);
                        handlePhysicalState(value);
                      }}
                      defaultValue={""}
                      placeholder="State"
                      isDisabled={isDisabled}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="physicalZip"
                render={({ field }) => (
                  <CustomFormItem label="Zip" required>
                    <CustomInput
                      disabled={isDisabled}
                      placeholder="Zip"
                      {...field}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
          </div>
          {/* google map */}
          <div className="h-[380px] mt-[20px] overflow-hidden">
            {guessAddress && guessAddress?.info && !isConfirmAddress && (
              <div className="mb-[10px]">
                Did you mean:
                <span
                  className="ml-[10px] text-[var(--primary-color)] cursor-pointer"
                  onClick={() => {
                    setConfirmDia(true);
                  }}
                >
                  {guessAddress.info}?
                </span>
              </div>
            )}
            {!loading && (
              <GoogleMap
                ref={mapRef}
                disabled={isDisabled}
                address={mapAddressInfo}
                markerDragEnd={async (lat: number, lng: number) => {
                  const address = await mapRef.current?.getAddressByLatLng(
                    lat,
                    lng
                  );
                  setGuessAddress(address);
                  setIsConfirmAddress(false);
                }}
              />
            )}
          </div>
        </TitleBlock>
        <TitleBlock title="Mailing Address" link={() => linkHtml}>
          <div className="flex space-x-12 mb-[10px]">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="mailingAddress"
                render={({ field }) => (
                  <CustomFormItem label="Address Line 1">
                    <CustomInput
                      disabled={isDisabled}
                      placeholder="Address Line 1"
                      {...field}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="mailingAddress2"
                render={({ field }) => (
                  <CustomFormItem label="Address Line 2">
                    <CustomInput
                      disabled={isDisabled}
                      placeholder="Address Line 2"
                      {...field}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
          </div>
          <div className="flex space-x-12">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="mailingCity"
                render={({ field }) => (
                  <CustomFormItem label="City">
                    <CustomInput
                      disabled={isDisabled}
                      placeholder="City"
                      {...field}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="mailingState"
                render={({ field }) => (
                  <CustomFormItem label="State">
                    <Select
                      isDisabled={isDisabled}
                      options={stateList}
                      onChange={field.onChange}
                      value={field.value}
                      isClearable
                      defaultValue={field.value}
                      placeholder="State"
                    />
                  </CustomFormItem>
                )}
              />
            </div>
          </div>
          <div className="flex space-x-12">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="mailingZip"
                render={({ field }) => (
                  <CustomFormItem label="Zip">
                    <CustomInput
                      disabled={isDisabled}
                      placeholder="Zip"
                      {...field}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
            <div className="flex-1"></div>
          </div>
        </TitleBlock>
        <TitleBlock title="Billing Info">
          <div className="flex space-x-12">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="billingEmail"
                render={({ field }) => (
                  <CustomFormItem label="Billing Contact Email">
                    <CustomInput
                      disabled={isDisabled}
                      placeholder="Billing Contact Email"
                      {...field}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="billingContact"
                render={({ field }) => (
                  <CustomFormItem label="Billing Contact Name">
                    <CustomInput
                      disabled={isDisabled}
                      placeholder="Billing Contact Name"
                      {...field}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
          </div>
        </TitleBlock>

        <TitleBlock title="Community Settings">
          <div className="flex space-x-12">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="startOfWeek"
                render={({ field }) => (
                  <CustomFormItem
                    label="Start Day of Week for Schedule"
                    required
                  >
                    <Select
                      maxMenuHeight={250}
                      isDisabled={isDisabled || startDayReadOnly}
                      options={WEEK_DATA_FOR_SELECT}
                      value={field.value}
                      onChange={field.onChange}
                      defaultValue={""}
                    />
                  </CustomFormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="attendanceEnabled"
                render={({ field }) => (
                  <CustomFormItem
                    label="Will you also be using NASTi's Time and Attendance functionality?"
                    required
                  >
                    <Select
                      isDisabled={isDisabled}
                      options={YES_NO_LIST}
                      value={field.value === true ? "Yes" : "No"}
                      onChange={(e) => {
                        field.onChange({
                          target: {
                            value: e === "Yes",
                          },
                        });
                      }}
                      placeholder="Time Zone"
                    />
                  </CustomFormItem>
                )}
              />
            </div>
          </div>
          <div className="flex space-x-12 pb-[150px]">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="timeZoneId"
                render={({ field }) => (
                  <CustomFormItem label="Time Zone" required>
                    <Select
                      isDisabled={true}
                      options={timeZoneOptions}
                      onChange={field.onChange}
                      value={field.value}
                      placeholder="Time Zone"
                    />
                  </CustomFormItem>
                )}
              />
            </div>
            <div className="flex-1"></div>
          </div>
        </TitleBlock>
        {/* <AuthProvide
          authenticate={pathname === "/myCommunity"}
          permissionName="COMMUNITY_MANAGEMENT_EDIT"
        > */}
        <CommunityButton
          loading={loading}
          type="submit"
          className={cn(
            "absolute bottom-0 left-0 right-[26px] bg-white mt-0  flex items-end justify-end pr-[10px]",
            isEdit && "h-[78px]",
            buttonClassName
          )}
        />
        {/* </AuthProvide> */}
      </CustomForm>
      {initLoading && (
        <div className="flex items-center justify-center absolute top-0 left-0 z-[999]  w-full h-full bg-white">
          <Loader2 className="mr-2 font-[390] animate-spin opacity-[0.5]" />
        </div>
      )}
      {confirmDia && guessAddress && (
        <ConfirmDialog
          open={confirmDia}
          onClose={() => {
            setConfirmDia(false);
          }}
          onOk={() => {
            guessAddress.physicalAddress &&
              form.setValue("physicalAddress", guessAddress.physicalAddress);
            guessAddress.physicalCity &&
              form.setValue("physicalCity", guessAddress.physicalCity);
            guessAddress.physicalZip &&
              form.setValue("physicalZip", guessAddress.physicalZip);

            // set state
            if (guessAddress.physicalState) {
              const stateValueList = stateList.filter((item: any) => {
                return item.label === guessAddress.physicalState;
              }) as any;

              stateValueList &&
                stateValueList.length > 0 &&
                form.setValue(
                  "physicalState",
                  (stateValueList[0] as any).value
                );
            }

            // change marker
            handleGetTimeZoneByLocation(guessAddress.lat, guessAddress.lng);
            setMapAddressInfo(guessAddress);
            setConfirmDia(false);
            // setOpen?.();
            //change map zoom
            mapRef.current?.setMapZoom(18);

            setTimeout(() => {
              setIsConfirmAddress(true);
            }, 200);
          }}
        >
          <div className="mb-[10px]">
            Did you mean:
            <span className="ml-[6px] text-[var(--primary-color)]">
              {guessAddress.info}?
            </span>
          </div>
        </ConfirmDialog>
      )}
    </div>
  );
}

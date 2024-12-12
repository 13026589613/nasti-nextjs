import { useSetState } from "ahooks";
import { useEffect, useState } from "react";

import {
  tryCoverUfgShift,
  tryCoverUfgShiftList,
} from "@/api/shiftsThatNeedHelp/callOffShift";
import Button from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import FormItemLabel from "@/components/custom/FormItemLabel";
import CustomSelect, { OptionType } from "@/components/custom/Select";
import Spin from "@/components/custom/Spin";
import Table from "@/components/custom/Table";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import useGlobalTime from "@/hooks/useGlobalTime";

import useSelectShiftToCoverColumn from "../hooks/SelectShiftToCoverColumn";
import { CandidateShifts, TryCoverUfgShiftReq, UfgRequestVo } from "../types";

export type BtnType = "remove" | "new" | "cover";
interface SelectShiftToCoverDiaProps {
  open: boolean;
  comment?: string;
  ufgId: string;
  onClose: () => void;
  onSuccessful: () => void;
}

const SelectShiftToCoverDia = (props: SelectShiftToCoverDiaProps) => {
  const { open, ufgId, comment, onClose, onSuccessful } = props;

  const { communityId } = useGlobalCommunityId();

  const { UTCMoment, zoneAbbr } = useGlobalTime();

  const [ufgInfo, setUfgInfo] = useSetState({} as UfgRequestVo);

  const [loading, setLoading] = useState(false);

  const [selectOption, setSelectOption] = useSetState({
    origin: [],
    option: [],
    loading: false,
  } as {
    origin: CandidateShifts[];
    option: OptionType[];
    loading: boolean;
  });

  const [selectedShift, setSelectedShift] = useState([] as CandidateShifts[]);

  const getList = async () => {
    try {
      setSelectOption({ loading: true });
      const res = await tryCoverUfgShiftList({
        ufgRequestId: ufgId,
      });
      if (res.code === 200) {
        setUfgInfo(res.data.shiftUfgRequest);
        setSelectOption({
          origin: res.data.candidateShifts,
          option: res.data.candidateShifts.map((item) => ({
            label: `${item.userName || "OPEN"} ${UTCMoment(
              item.startTimeUTC
            ).format("MM/DD/YYYY hh:mm A")} - ${UTCMoment(
              item.endTimeUTC
            ).format("MM/DD/YYYY hh:mm A")} (${zoneAbbr})`,
            value: item.id,
            isOpen: !item.userName,
          })),
        });
      }
    } finally {
      setSelectOption({ loading: false });
    }
  };

  useEffect(() => {
    if (open) {
      getList();
    }
  }, [open]);

  const onSelectChange = (value: string) => {
    const shift = selectOption.origin.find((item) => item.id === value);
    if (shift) {
      setSelectOption({
        option: selectOption.option.filter((item) => item.value !== value),
      });
      setSelectedShift([shift, ...selectedShift]);
    }
  };

  const clickDelete = (id: string) => {
    const shift = selectOption.origin.find((item) => item.id === id);
    if (shift) {
      setSelectOption({
        option: [
          {
            label: `${shift.userName || "OPEN"} ${UTCMoment(
              shift.startTimeUTC
            ).format("MM/DD/YYYY hh:mm A")} - ${UTCMoment(
              shift.endTimeUTC
            ).format("MM/DD/YYYY hh:mm A")} (${zoneAbbr})`,
            value: shift.id,
          },
          ...selectOption.option,
        ],
      });
      setSelectedShift(selectedShift.filter((item) => item.id !== id));
    }
  };

  const [errorDia, setErrorDia] = useSetState({
    visible: false,
    validateMsg: [] as string[],
  });

  const onSubmit = async () => {
    try {
      setLoading(true);

      const errorShift = selectedShift.find((item) => {
        const { startTimeUTC, endTimeUTC } = item;

        if (UTCMoment(startTimeUTC).isSameOrAfter(UTCMoment(endTimeUTC))) {
          return true;
        }
      });

      if (errorShift) {
        return;
      }

      const params: TryCoverUfgShiftReq = {
        communityId: communityId,
        ufgRequestId: ufgId,
        shifts: selectedShift.map((item) => {
          return {
            id: item.id,
            communityId: item.communityId,
            startTimeLocal: UTCMoment(item.startTimeUTC).format(
              "MM/DD/YYYY HH:mm:ss"
            ),
            endTimeLocal: UTCMoment(item.endTimeUTC).format(
              "MM/DD/YYYY HH:mm:ss"
            ),
          };
        }),
        reviewComment: comment ? comment.trim() : undefined,
      };
      const res = await tryCoverUfgShift(params);
      if (res.code === 200) {
        if (res.data.isSuccess) {
          onClose && onClose();
          onSuccessful && onSuccessful();
        } else {
          setErrorDia({
            visible: true,
            validateMsg: res.data.errorMsg,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const { columns } = useSelectShiftToCoverColumn({
    onClick: clickDelete,
    selectedShift,
    setSelectedShift,
  });
  // const CustomMenu = (props: any) => {
  //   const { innerProps, innerRef, label, isSelected, data } = props;

  //   return (
  //     <div
  //       ref={innerRef}
  //       {...innerProps}
  //       className={`${
  //         isSelected ? "bg-[#EB1DB2]" : "hover:bg-[#DEEBFF]"
  //       } flex items-center px-3 py-2`}
  //     >
  //       {data.isOpen && (
  //         <div className="flex items-center justify-center w-[70px] h-[32px] border border-[#F2994A] text-[14px] text-[#F2994A] font-[390] mr-4">
  //           OPEN
  //         </div>
  //       )}
  //       <span>{label}</span>
  //     </div>
  //   );
  // };

  // Dialog Form
  return (
    <>
      <CustomDialog
        width={"80vw"}
        title={"Select Shift"}
        open={open}
        onClose={() => {
          onClose && onClose();
        }}
      >
        <Spin loading={selectOption.loading}>
          <>
            <FormItemLabel label={"Shift Time Needing Coverage:"}>
              <div className="min-h-10 leading-10 text-[#919FB4]">{`${UTCMoment(
                ufgInfo.coverageStartTimeUtc
              ).format("MM/DD/YYYY hh:mm A")} - ${UTCMoment(
                ufgInfo.coverageEndTimeUtc
              ).format("MM/DD/YYYY hh:mm A")} (${zoneAbbr})`}</div>
            </FormItemLabel>
            <FormItemLabel
              labelClassName="font-[450]"
              label={
                "Please select the shift(s) that you want to change to cover the time range that needs coverage:"
              }
            >
              <CustomSelect
                options={selectOption.option}
                onChange={onSelectChange}
                closeMenuOnSelect={false}
              ></CustomSelect>
            </FormItemLabel>
            <div className="w-full mt-6 text-center text-primary font-[390] text-[16px]">
              Please adjust the time of the shifts below to cover the remaining
              hours:
            </div>
            {selectedShift && (
              <Table
                className="my-6 min-h-[100px]"
                height="auto"
                adaptive={false}
                data={selectedShift}
                columns={columns}
                scrollClassName="overflow-visible"
              ></Table>
            )}
          </>
        </Spin>
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
            Confirm
          </Button>
        </div>
        {errorDia.visible && (
          <ConfirmDialog
            open={errorDia.visible}
            width="560px"
            isShowCancel={false}
            title="Alert"
            okText="OK"
            onClose={() => {
              setErrorDia({
                visible: false,
                validateMsg: [],
              });
            }}
            onOk={() => {
              setErrorDia({
                visible: false,
                validateMsg: [],
              });
            }}
          >
            <div>
              {errorDia.validateMsg.map((msg, index) => (
                <div key={index}>{msg}</div>
              ))}
            </div>
          </ConfirmDialog>
        )}
      </CustomDialog>
    </>
  );
};

export default SelectShiftToCoverDia;

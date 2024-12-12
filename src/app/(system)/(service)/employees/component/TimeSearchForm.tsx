import { useDebounceFn } from "ahooks";
import { Fragment, useEffect, useState } from "react";

import { getworkerRoleSelect } from "@/api/employees";
import RangeDatePicker from "@/components/custom/RangeDatePicker";
// import Input from "@/components/custom/Input";
import Select from "@/components/custom/Select";
import useGlobalCommunityId from "@/hooks/useGlobalCommunityId";
import sortListByKey from "@/utils/sortByKey";

import { SearchParams } from "../type";

interface TimeSearchFormProps {
  resetSearch?: () => void;
  startDate: string[] | null;
  endDate: string[] | null;
  setStartDate: (param: string[] | null) => void;
  setEndDate: (param: string[] | null) => void;
  searchParams: SearchParams;
  setSearchParams: (value: SearchParams) => void;
  communityId: string;
  defaultActiveKey: string;
}
const TimeSearchForm = (props: TimeSearchFormProps) => {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    searchParams,
    setSearchParams,
    communityId,
    defaultActiveKey,
  } = props;
  const { attendanceEnabled } = useGlobalCommunityId();

  const [workerRoleList, setWorkerRoleList] = useState([]);
  const exceptionList = attendanceEnabled
    ? [
        {
          label: "No Show",
          value: "NO_SHOW",
        },
        {
          label: "Early Check Out",
          value: "EARLY_CHECK_OUT",
        },
        {
          label: "Late Check In",
          value: "LATE_CHECK_IN",
        },
        {
          label: "Late Check Out",
          value: "LATE_CHECK_OUT",
        },
        {
          label: "Late Check Out - Ongoing",
          value: "LATE_CHECK_OUT_ONGOING",
        },
        {
          label: "Left without Checking Out",
          value: "LEFT_WITHOUT_CHECKING_OUT",
        },
        {
          label: "Break Time Exception",
          value: "BREAK_TIME_EXCEPTION",
        },
        {
          label: "Swap",
          value: "SWAP_REQUEST",
        },
        {
          label: "Up for Grabs",
          value: "UP_FOR_GRABS",
        },
        {
          label: "Call-off",
          value: "CALL_OFF",
        },
      ]
    : [
        {
          label: "Swap",
          value: "SWAP_REQUEST",
        },
        {
          label: "Up for Grabs",
          value: "UP_FOR_GRABS",
        },
        {
          label: "Call-off",
          value: "CALL_OFF",
        },
      ];

  const { run } = useDebounceFn(
    () => {
      // search();
    },
    {
      wait: 500,
    }
  );
  useEffect(() => {
    if (communityId) {
      getRoleList(communityId);
    }
  }, [communityId]);
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
        setWorkerRoleList(sortListByKey(result) as []);
      }
    } finally {
    }
  };
  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-5 flex-wrap w-full">
          {["CurrentShifts", "PastShifts"].includes(defaultActiveKey) && (
            <Fragment>
              <div className="w-[calc(25%-15px)]">
                <div className="w-full leading-10 ">Shift Date</div>
                <RangeDatePicker
                  value={startDate}
                  onChange={(value) => {
                    setStartDate(value || null);
                  }}
                ></RangeDatePicker>
              </div>
              <div className="w-[calc(25%-15px)]">
                <div className="w-full leading-10 ">Role</div>
                <Select
                  options={workerRoleList}
                  value={searchParams.roleId}
                  placeholder="Role"
                  isClearable
                  onChange={(e) => {
                    setSearchParams({
                      roleId: e,
                    });
                    run();
                  }}
                />
              </div>
              {defaultActiveKey === "PastShifts" && (
                <div className="w-[calc(25%-15px)]">
                  <div className="w-full leading-10 ">Exception</div>
                  <Select
                    isClearable
                    options={exceptionList.sort((a, b) =>
                      a.label.localeCompare(b.label)
                    )}
                    value={searchParams.exceptions}
                    placeholder="Exception"
                    onChange={(e) => {
                      setSearchParams({
                        exceptions: e,
                      });
                      run();
                    }}
                  />
                </div>
              )}
            </Fragment>
          )}

          {(defaultActiveKey == "timeOffRequests" ||
            defaultActiveKey == "timeOffHistory") && (
            <Fragment>
              <div className="w-[calc(25%-15px)]">
                <div>
                  <div className="w-full leading-10 ">Start Date Time</div>
                  <RangeDatePicker
                    value={startDate}
                    onChange={(value) => {
                      setStartDate(value || null);
                    }}
                  ></RangeDatePicker>
                </div>
              </div>
              <div className="w-[calc(25%-15px)]">
                <div>
                  <div className="w-full leading-10 ">End Date Time</div>
                  <RangeDatePicker
                    value={endDate}
                    onChange={(value) => {
                      setEndDate(value || null);
                    }}
                  ></RangeDatePicker>
                </div>
              </div>
            </Fragment>
          )}
          {defaultActiveKey == "timeOffHistory" && (
            <div className="w-[calc(25%-15px)]">
              <div className="w-full leading-10 ">Status</div>
              <Select
                isMulti
                options={[
                  {
                    value: "APPROVED",
                    label: "Approved",
                  },
                  {
                    value: "REJECTED",
                    label: "Rejected",
                  },
                ]}
                value={searchParams.status}
                placeholder="Status"
                onChange={(e) => {
                  setSearchParams({
                    status: e,
                  });
                  run();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSearchForm;

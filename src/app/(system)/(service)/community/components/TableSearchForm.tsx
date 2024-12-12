import { useEffect, useState } from "react";

import { getRegionsListData } from "@/api/sys";
import CustomButton from "@/components/custom/Button";
import Input from "@/components/custom/Input";
import CustomCreatableSelect from "@/components/custom/Select/creatableSelect";

import { SearchParams } from "../types";
/**
 * @description Search Props
 */
interface TableSearchFormProps {
  resetSearch: () => void;
  search: () => void;
  add: () => void;
  searchParams: Partial<SearchParams>;
  setSearchParams: (value: SearchParams) => void;
}

/**
 * @description Table Search Form
 */
const TableSearchForm = (props: TableSearchFormProps) => {
  const { resetSearch, search, searchParams, setSearchParams } = props;

  const [cityValue, setCityValue] = useState(null);
  const [stateValue, setStateValue] = useState(null);

  const [selectDataState, setSelectDataState] = useState([]);
  const [selectDataCity, setSelectDataCity] = useState([]);

  // init
  useEffect(() => {
    getCitySelectList();
    getStateSelectList();
  }, []);

  /**
   * @description Get City Select
   */
  const getCitySelectList = async () => {
    const res = await getRegionsListData({
      type: 2,
    });

    if (res.code == 200) {
      const arr = res.data.map((item: any) => {
        return {
          label: item.name,
          value: item.id,
        };
      }) as [];

      setSelectDataCity(arr);
    }
  };

  /**
   * @description Get State Select
   */
  const getStateSelectList = async () => {
    const res = await getRegionsListData({
      type: 1,
    });
    if (res.code == 200) {
      const arr = res.data.map((item: any) => {
        return {
          label: item.name,
          value: item.id,
        };
      }) as [];
      setSelectDataState(arr);
    }
  };

  return (
    <div className="w-full weight-[390]">
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-5 flex-wrap w-full">
          {/* Search Params - Start */}

          {/* Filter Param - name */}
          <div className="w-[calc(25%-15px)]">
            <div className="w-full leading-10 ">Community Name</div>
            <Input
              value={searchParams.name}
              onChange={(e) => {
                setSearchParams({
                  name: e.target.value,
                  physicalCity: searchParams.physicalCity,
                  physicalStateName: searchParams.physicalStateName
                    ? searchParams.physicalStateName
                    : "",
                });
              }}
              placeholder="Community Name"
            ></Input>
          </div>
          {/* Filter Param - physicalCity */}
          <div className="w-[calc(25%-15px)]">
            <div className="w-full leading-10 ">City</div>
            <CustomCreatableSelect
              placeholder="City"
              isSearchable
              autoFocus
              value={cityValue}
              options={selectDataCity}
              onChange={(opt: any) => {
                setSearchParams({
                  name: searchParams.name,
                  physicalCity: opt.label,
                  physicalStateName: searchParams.physicalStateName
                    ? searchParams.physicalStateName
                    : "",
                });
                setCityValue(opt);
              }}
            ></CustomCreatableSelect>
          </div>
          {/* Filter Param - physicalStateName */}
          <div className="w-[calc(25%-15px)]">
            <div className="w-full leading-10 ">State</div>
            <CustomCreatableSelect
              placeholder="State"
              isSearchable
              autoFocus
              value={stateValue}
              options={selectDataState}
              onChange={(opt: any) => {
                setSearchParams({
                  name: searchParams.name,
                  physicalCity: searchParams.physicalCity,
                  physicalStateName: opt.label,
                });
                setStateValue(opt);
              }}
            ></CustomCreatableSelect>
          </div>

          {/* Search Params - End */}

          {/* Operate Btns - Start */}
          <div className="flex items-end h-20 ">
            <CustomButton
              variant="outline"
              onClick={() => {
                setSearchParams({
                  name: "",
                  physicalCity: "",
                  physicalStateName: "",
                }); // Reset Search Params
                setCityValue(null);
                setStateValue(null);
                resetSearch(); // Reset Search Params
              }}
            >
              Reset
            </CustomButton>
          </div>
          <div className="flex items-end h-20 ">
            <CustomButton
              icon="search"
              colorStyle="purple"
              onClick={() => {
                search(); // Search Data
              }}
            >
              Search
            </CustomButton>
          </div>

          {/* Add Button */}
          <div className="flex items-end h-20 ">
            <CustomButton icon="add" onClick={props.add}>
              Add
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSearchForm;

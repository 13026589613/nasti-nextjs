import { useState } from "react";
import { toast } from "sonner";

import {
  deletePbjCategoty,
  // listPbjCatrgoty
} from "@/api/admin/pbjJob/index";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
import Spin from "@/components/custom/Spin";
import { MESSAGE } from "@/constant/message";
import SelectIcon from "~/icons/SelectIcon.svg";

import AddCategory from "./AddCategory";

type Props = {
  categoryList?: string[];
  getNameList?: () => void;
  getList?: () => void;
  getCategoryName?: (categoryName: string) => void;
};

const PBJJobsList = (props: Props) => {
  const { categoryList, getNameList, getList, getCategoryName } = props;

  const [open, setOpen] = useState(false);

  const [isExpanded, setIsExpanded] = useState(true);

  const [loading, setLoading] = useState(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [deleteItem, _setDeleteItem] = useState<string>();

  const [editItem, setEditItem] = useState<any>(null);

  const toggleList = () => {
    setIsExpanded(!isExpanded);
  };

  const deleteItemHandler = async () => {
    setLoading(true);
    try {
      const { code, data } = await deletePbjCategoty(deleteItem || "");
      if (code === 200 && data) {
        toast.success(MESSAGE.delete, { position: "top-center" });
        setDeleteDialogOpen(false);
        getNameList?.();
        setActiveIndex(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // const setCateGoryItemInfo = async (name: string) => {
  //   try {
  //     const { code, data } = await listPbjCatrgoty(name);
  //     if (code === 200) {
  //       let item = {
  //         name: data[0].name ?? "",
  //         rowList: data,
  //       };
  //       setEditItem(item);
  //     }
  //   } finally {
  //   }
  // };

  return (
    <Spin loading={loading}>
      <div style={{ width: 320 }} className="pr-9 mt-9">
        <div className="flex justify-between items-center h-[40px]">
          <div className="flex items-center">
            <SelectIcon
              onClick={toggleList}
              className={`fas fa-angle-down transition-transform transform cursor-pointer ${
                !isExpanded ? "rotate-180" : ""
              }`}
            />
            <div
              className="ml-2 cursor-pointer"
              onClick={() => {
                getCategoryName?.("");
                setActiveIndex(null);
              }}
            >
              PBJ Jobs
            </div>
          </div>
          {/* <div
            className="text-[#EB1DB2] cursor-pointer"
            onClick={() => {
              setOpen(true);
            }}
          >
            Add Category
          </div> */}
        </div>
        <div
          className={`pl-4 pr-2 mt-3 overflow-y-auto transition-all duration-300 overflow-hidden ${
            isExpanded ? "max-h-[calc(73vh)]" : "max-h-0"
          }`}
        >
          {categoryList?.map((item, index) => {
            return (
              <div
                key={index}
                className="flex justify-between items-center hover:text-[#EB1DB2] cursor-pointer"
                onClick={() => {
                  setActiveIndex(index);
                  getCategoryName?.(item);
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={`h-[36px] w-48 truncate text-left ${
                    activeIndex === index || hoveredIndex === index
                      ? "text-[#EB1DB2]"
                      : "hover:text-[#EB1DB2] text-[#919FB4]"
                  }`}
                  title={item}
                >
                  {item}
                </div>
                <div
                  className={`${
                    activeIndex === index || hoveredIndex === index
                      ? ""
                      : "hidden"
                  }`}
                >
                  {/* <Tooltip content="Edit">
                    <Edit
                      className="cursor-pointer mr-3"
                      width={16}
                      color={"#EB1DB2"}
                      onClick={() => {
                        setOpen(true);
                        setCateGoryItemInfo(item || "");
                      }}
                    ></Edit>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <Delete
                      className="cursor-pointer"
                      width={16}
                      color={"#13227A"}
                      onClick={() => {
                        setDeleteItem(item);
                        setDeleteDialogOpen(true);
                      }}
                    ></Delete>
                  </Tooltip> */}
                </div>
              </div>
            );
          })}
          {categoryList?.length === 0 && (
            <div className="flex justify-center items-center mt-28 text-[#5c5e63] text-base">
              <div>No data.</div>
            </div>
          )}
        </div>

        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
          }}
          onOk={() => {
            deleteItemHandler();
          }}
        >
          Are you sure you want to delete this item?
        </ConfirmDialog>

        <AddCategory
          editItem={editItem}
          open={open}
          setOpen={() => {
            setOpen(false);
            setEditItem(null);
          }}
          categoryList={categoryList}
          getList={(type: string) => {
            if (type === "create") {
              setActiveIndex(null);
              getNameList?.();
            } else if (type === "edit") {
            }
            getList?.();
          }}
        />
      </div>
    </Spin>
  );
};

export default PBJJobsList;

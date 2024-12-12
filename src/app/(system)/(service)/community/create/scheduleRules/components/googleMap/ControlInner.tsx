import React, { useMemo } from "react";

import { cn } from "@/lib/utils";
// import ExitEditIcon from "~/icons/ExitEditIcon.svg";
import MapDeleteIcon from "~/icons/MapDeleteIcon.svg";

import { PolygonRefItem } from "../googleMap";

interface ControlInnerProps {
  drawing: boolean;
  polygonRefItem: PolygonRefItem;
  type: "CHECK_IN" | "CHECK_OUT" | null;
  setType: (type: "CHECK_IN" | "CHECK_OUT" | null) => void;
  typeChange: (type: "CHECK_IN" | "CHECK_OUT" | null) => void;
  deletePolygon: (type: "CHECK_IN" | "CHECK_OUT") => void;
}

const ControlInner = (props: ControlInnerProps) => {
  const { polygonRefItem, drawing, type, setType, typeChange, deletePolygon } =
    props;

  // const [type, setType] = React.useState<"CHECK_IN" | "CHECK_OUT" | null>(null);

  const canChangeType = useMemo(() => {
    if (drawing) {
      return false;
    }
    if (type === "CHECK_IN" && !polygonRefItem.hasConfirmCheckIn) {
      return false;
    }
    if (type === "CHECK_OUT" && !polygonRefItem.hasConfirmCheckOut) {
      return false;
    }
    return true;
  }, [type, polygonRefItem, drawing]);

  return (
    <div
      className={cn(
        " mt-[20px] ml-[10px] bg-white rounded-l-[3px] flex flex-col",
        "shadow-[0,4px,8px,3px,#00000026]"
      )}
    >
      <TypeButton
        type="CHECK_IN"
        disabled={drawing}
        polygonRefItem={polygonRefItem}
        deletePolygon={deletePolygon}
        onClick={() => {
          if (canChangeType) {
            if (type === "CHECK_IN") {
              setType(null);
              typeChange(null);
            } else {
              setType("CHECK_IN");
              typeChange("CHECK_IN");
            }
          }
        }}
        active={type === "CHECK_IN"}
      ></TypeButton>
      <TypeButton
        disabled={drawing}
        polygonRefItem={polygonRefItem}
        type="CHECK_OUT"
        deletePolygon={deletePolygon}
        onClick={() => {
          if (canChangeType) {
            if (type === "CHECK_OUT") {
              setType(null);
              typeChange(null);
            } else {
              setType("CHECK_OUT");
              typeChange("CHECK_OUT");
            }
          }
        }}
        active={type === "CHECK_OUT"}
      ></TypeButton>
    </div>
  );
};
export default ControlInner;

const TypeButton = (props: {
  disabled?: boolean;
  type: "CHECK_IN" | "CHECK_OUT";
  active: boolean;
  polygonRefItem: PolygonRefItem;
  onClick: () => void;
  deletePolygon: (type: "CHECK_IN" | "CHECK_OUT") => void;
}) => {
  const { type, active, polygonRefItem, disabled, onClick, deletePolygon } =
    props;
  const classNames = {
    CHECK_IN: "bg-[#69DD304D] border-[#63E400]",
    CHECK_OUT: "bg-[#FFD48E80] border-[#FF8A0C]",
  };

  const hasPolygon = useMemo(() => {
    if (type === "CHECK_IN" && polygonRefItem.checkInPolygon) {
      return true;
    }
    if (type === "CHECK_OUT" && polygonRefItem.checkOutPolygon) {
      return true;
    }
    return false;
  }, [type, polygonRefItem]);

  const hasEdit = useMemo(() => {
    if (type === "CHECK_IN" && !polygonRefItem.hasConfirmCheckIn) {
      return true;
    }
    if (type === "CHECK_OUT" && !polygonRefItem.hasConfirmCheckOut) {
      return true;
    }
    return false;
  }, [type, polygonRefItem]);

  return (
    <div className="relative w-full">
      <div
        onClick={() => {
          if (disabled) return;
          onClick();
        }}
        className={cn(
          "flex items-center gap-2 w-full h-9 p-3 cursor-pointer",
          type === "CHECK_IN" && "border-b-[1px] border-b-[#E7EDF1]",
          active && "border-primary"
        )}
      >
        <div className={cn("w-5 h-3 border-[1px]", classNames[type])}></div>
        <div
          className={cn(
            "text-[#919FB4] text-[16px] font-[390]",
            active && "text-primary"
          )}
        >
          {type === "CHECK_IN" ? "Check In Area" : "Check Out Area"}
        </div>
      </div>
      {active && (
        <div className="absolute top-0 right-0 translate-x-[100%] flex items-center h-full">
          {!hasEdit && (
            <>
              {hasPolygon && (
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-full",
                    "border-r-[1px] border-r-[#E7EDF1] bg-[#fff]",
                    "cursor-pointer"
                  )}
                  onClick={() => {
                    deletePolygon(type);
                  }}
                >
                  <MapDeleteIcon
                    width={18}
                    height={18}
                    color={"#F55F4E"}
                  ></MapDeleteIcon>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

import { NeedHelpShiftTabsKey } from "../page";
import {
  CallOffOrUFGRes,
  NeedHelpShift,
  ShiftUfgRequestListRes,
} from "../types";
import ReviewCallOff from "./review/ReviewCallOff";
import ReviewOpenShift from "./review/ReviewOpenShift";
import ReviewOvertimeShift from "./review/ReviewOvertimeShift";
import ReviewSwapsShift from "./review/ReviewSwapsShift";
import ReviewUpForGrabs from "./review/ReviewUpForGrabs";
import ViewCallOff from "./view/ViewCallOff";
import ViewOpenShift from "./view/ViewOpenShift";
import ViewOvertimeShift from "./view/ViewOvertimeShift";
import ViewSwapsShift from "./view/ViewSwapsShift";
import ViewUpForGrabs from "./view/ViewUpForGrabs";

const EditOrView = (props: {
  type: NeedHelpShiftTabsKey | "";
  isView: boolean;
  needHelpShift:
    | NeedHelpShift
    | CallOffOrUFGRes
    | ShiftUfgRequestListRes
    | null;
  onClose?: () => void;
  onSuccessful?: () => void;
}) => {
  const { type, isView, needHelpShift, onClose, onSuccessful } = props;

  if (isView) {
    return (
      <>
        {type === "shiftSwaps" && (
          <ViewSwapsShift
            onClose={onClose}
            needHelpShift={needHelpShift as NeedHelpShift}
          ></ViewSwapsShift>
        )}
        {type === "upForGrabs" && (
          <ViewUpForGrabs
            onClose={onClose}
            needHelpShift={needHelpShift as ShiftUfgRequestListRes}
          ></ViewUpForGrabs>
        )}
        {type === "callOffs" && (
          <ViewCallOff
            onClose={onClose}
            needHelpShift={needHelpShift as NeedHelpShift}
          ></ViewCallOff>
        )}
        {type === "openShiftClaims" && (
          <ViewOpenShift
            onClose={onClose}
            needHelpShift={needHelpShift as NeedHelpShift}
          ></ViewOpenShift>
        )}
        {type === "overtimeShifts" && (
          <ViewOvertimeShift
            type={type}
            onClose={onClose}
            needHelpShift={needHelpShift as NeedHelpShift}
          ></ViewOvertimeShift>
        )}
      </>
    );
  }
  return (
    <>
      {type === "shiftSwaps" && (
        <ReviewSwapsShift
          onClose={onClose}
          onSuccessful={onSuccessful}
          needHelpShift={needHelpShift as NeedHelpShift}
        ></ReviewSwapsShift>
      )}
      {type === "upForGrabs" && (
        <ReviewUpForGrabs
          onClose={onClose}
          onSuccessful={onSuccessful}
          needHelpShift={needHelpShift as ShiftUfgRequestListRes}
        ></ReviewUpForGrabs>
      )}
      {type === "callOffs" && (
        <ReviewCallOff
          onClose={onClose}
          onSuccessful={onSuccessful}
          needHelpShift={needHelpShift as any}
        ></ReviewCallOff>
      )}
      {type === "openShiftClaims" && (
        <ReviewOpenShift
          onClose={onClose}
          onSuccessful={onSuccessful}
          needHelpShift={needHelpShift as NeedHelpShift}
        ></ReviewOpenShift>
      )}
      {type === "overtimeShifts" && (
        <ReviewOvertimeShift
          type={type}
          onClose={onClose}
          onSuccessful={onSuccessful}
          needHelpShift={needHelpShift as NeedHelpShift}
        ></ReviewOvertimeShift>
      )}
    </>
  );
};

export default EditOrView;

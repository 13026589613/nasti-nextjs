import { SetState } from "ahooks/lib/useSetState";

import { ScheduleShift } from "@/api/currentSchedule/types";
import ConfirmDialog from "@/components/custom/Dialog/confirm";
interface PublishShiftErrorDiaProps {
  publishErrorConfirm: {
    visible: boolean;
    loading: boolean;
    validateMsg: string[];
    data: ScheduleShift | null;
  };
  setPublishErrorConfirm: SetState<{
    visible: boolean;
    loading: boolean;
    validateMsg: string[];
    data: ScheduleShift | null;
  }>;
  callBack: () => void;
  refresh: () => void;
}
const PublishShiftErrorDia = (props: PublishShiftErrorDiaProps) => {
  const { publishErrorConfirm, setPublishErrorConfirm, callBack, refresh } =
    props;

  return (
    <>
      {publishErrorConfirm.visible && (
        <ConfirmDialog
          open={publishErrorConfirm.visible}
          btnLoading={publishErrorConfirm.loading}
          width="560px"
          onClose={() => {
            setPublishErrorConfirm({
              visible: false,
              loading: false,
              validateMsg: [],
              data: null,
            });
            refresh();
          }}
          onOk={() => {
            callBack();
          }}
        >
          <div>
            {publishErrorConfirm.validateMsg.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
        </ConfirmDialog>
      )}
    </>
  );
};

export default PublishShiftErrorDia;

import { CommunityVo } from "@/api/admin/community/type";
import CustomDialog from "@/components/custom/Dialog";

import CommunityInfo from "../components/communityInfo";
interface CreateDiaProps {
  open: boolean;
  operateItem: CommunityVo | null;
  setOpen: (value: boolean) => void;
  onClose: () => void;
  getLsit: () => void;
}

const CreateDia = (props: CreateDiaProps) => {
  const { open, operateItem, setOpen, onClose, getLsit } = props;

  return (
    <CustomDialog
      width="80vw"
      title={operateItem ? "Edit Community" : "Add Community"}
      open={open}
      onClose={() => {
        onClose();
        setOpen(false);
      }}
    >
      <div className="overflow-y-auto overflow-x-hidden w-full max-h-[calc(100vh-180px)] pr-3 pb-4">
        <CommunityInfo
          editItem={operateItem}
          communityId={operateItem?.id}
          isEdit
          setOpen={() => {
            setOpen(false);
            getLsit?.();
          }}
        />
      </div>
    </CustomDialog>
  );
};
export default CreateDia;

import { Loader2 } from "lucide-react";
import {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from "react";

import { cn } from "@/lib/utils";
import UploadFIleIcon from "~/icons/UploadFIleIcon.svg";
interface UploadProps {
  loading?: boolean;
  accept?: string;
  onChange?: Function;
  disabled?: boolean;
  className?: string;
  hide?: boolean;
}

export type UploadRef = {
  onManualUpload: () => void;
};

const Upload: ForwardRefRenderFunction<UploadRef, UploadProps> = (
  { loading, accept, onChange, disabled, className, hide },
  ref
) => {
  function handleFileChange(event: any) {
    onChange && onChange(event);

    event.target.value = null;
  }
  function handleClickFile() {
    if (disabled) return;
    document.getElementById("file")?.click();
  }

  useImperativeHandle(ref, () => ({
    onManualUpload: handleClickFile,
  }));

  return (
    <div
      className={cn(
        "flex border border-[#E7EDF1] h-[40px] w-[135px] justify-center items-center rounded cursor-pointer px-[6px]",
        disabled && "opacity-50 cursor-not-allowed",
        hide && "hidden",
        className
      )}
      onClick={() => handleClickFile()}
    >
      <input
        className="hidden"
        id="file"
        type="file"
        accept={accept}
        onChange={handleFileChange}
      />
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UploadFIleIcon
          className="mr-[10px]"
          width="18"
          height="14"
          color="#EB1DB2"
        />
      )}

      <span className="text-[#EB1DB2]">Choose</span>
    </div>
  );
};

export default forwardRef(Upload);

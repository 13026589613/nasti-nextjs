import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  downloadTemplateAdmin,
  importEmployeesDataAdmin,
} from "@/api/admin/employees";
import { getSuperAdminCommunityList } from "@/api/user";
import CustomButton from "@/components/custom/Button";
import CustomDialog from "@/components/custom/Dialog";
import Select from "@/components/custom/Select";
import { MESSAGE } from "@/constant/message";
import CloseIcon from "~/icons/CloseIcon.svg";
import FileFlagIcon from "~/icons/FileFlagIcon.svg";
import UploadBoxIcon from "~/icons/UploadBoxIcon.svg";

import { EmployeesVo, ErrorEntityType } from "../type";
import ImportDia from "./ImportDia";
interface CreateDiaProps {
  isAdd: boolean;
  open: boolean;
  setOpen: (value: boolean) => void;
  editItem: EmployeesVo | null;
  onClose: () => void;
  getLsit: () => void;
  handleRefreshList: () => void;
  handleClickBtn?: (status: string) => void;
}
const UploadFileList = (props: CreateDiaProps) => {
  const { open, setOpen, onClose, handleRefreshList, handleClickBtn } = props;
  const [btnLoading, setBtnLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [file, setFile] = useState<any>("");
  const [toggleDailog, setToggleDailog] = useState(false);
  const [errTableData, setErrTableData] = useState<ErrorEntityType[]>([]);
  const [mathFile, setMathFile] = useState(1);
  function handleFileChange(file: any) {
    setFile(file);
  }

  const handleUploadTemplate = async () => {
    if (!communityId) {
      toast.warning("Please select a community first.");
      return;
    }
    if (!file) {
      toast.warning("Please upload a valid file.", {
        position: "top-center",
      });
      return;
    }
    setBtnLoading(true);
    try {
      let formData: any = new FormData();
      formData.append("file", file);
      const res = await importEmployeesDataAdmin(communityId, file);
      const { code, data, message }: any = res.data;
      if (code === 200) {
        setBtnLoading(false);
        const { errorItems, success } = data;
        if (success) {
          toast.success(MESSAGE.import, { position: "top-center" });
          setOpen(false);
          handleRefreshList();
          handleClickBtn?.("Pending");
        } else {
          setErrTableData(errorItems);
          setToggleDailog(true);
        }
      } else {
        toast.error(message, { position: "top-center" });
      }
    } finally {
      setBtnLoading(false);
    }
  };
  function handleCloseFile() {
    setFile("");
    setMathFile(Math.random());
  }

  function handleGetFile() {
    document.getElementById("imgFile")?.click();
  }

  const onImport = async () => {
    if (!communityId) {
      toast.warning("Please select a community first.");
      return;
    }

    setImportLoading(true);
    try {
      const res: any = await downloadTemplateAdmin(communityId);
      setBtnLoading(false);
      let blob = new Blob([res.data], {
        type: res.data + "charset=utf-8",
      });
      const downloadLink = document.createElement("a");
      const URL = window.URL || window.webkitURL;
      let downUrl = URL.createObjectURL(blob);
      downloadLink.href = downUrl;
      downloadLink.download = decodeURIComponent(
        res.headers["download-filename"]
      );
      downloadLink.click();
      window.URL.revokeObjectURL(downUrl);
    } finally {
      setImportLoading(false);
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(e.dataTransfer.files[0]);
  };

  const [communityIdList, setCommunityList] = useState<any>([]);
  const [communityId, setCommunityId] = useState("");

  const getCommunityListFn = async () => {
    try {
      const res = await getSuperAdminCommunityList();

      if (res.code == 200) {
        setCommunityList(
          res.data.map((item) => ({ label: item.name, value: item.id }))
        );
      }
    } finally {
    }
  };

  useEffect(() => {
    getCommunityListFn();
  }, []);

  return (
    <>
      {toggleDailog ? (
        <ImportDia
          open={open}
          errTableData={errTableData}
          setToggleDailog={setToggleDailog}
        />
      ) : (
        <CustomDialog
          title="Upload Employee List"
          open={open}
          width="500px"
          onClose={() => {
            setFile("");
            setMathFile(Math.random());
            onClose();
            setOpen(false);
          }}
        >
          <div
            className={"mr-4 leading-10 text-left font-[390] text-[#324664]"}
          >
            Community
            <span className="ml-[5px] font-[390] text-[16px] text-[var(--primary-color)]">
              *
            </span>
          </div>
          <Select
            options={communityIdList}
            value={communityId}
            onChange={(value) => {
              setCommunityId(value);
            }}
            isWrap
            placeholder="Community"
            className="mb-4"
          />

          <div className="font-[400] text-[14px] text-[#00000073] mb-[10px]">
            Notes: After the bulk upload, you need to send invites to the
            employees.
          </div>
          {/* upload input file */}
          <input
            className="hidden"
            id="imgFile"
            type="file"
            accept=".csv,.xls,.xlsx"
            key={mathFile}
            onChange={(event: any) => {
              const file = event.target.files[0];
              handleFileChange(file);
            }}
          />
          <div
            className="h-[150px] bg-[#FAFAFA] border border-[#D9D9D9] flex justify-center flex-col cursor-pointer"
            onClick={() => {
              handleGetFile();
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex justify-center">
              <UploadBoxIcon />
            </div>
            <div className="text-center mt-[20px] mb-[10px] font-[400] text-[16px] text-[#000000D9]">
              Click or drag file to this area to upload
            </div>
            <div className="text-center font-[400] text-[14px] text-[#00000073]">
              Supported file formats: xlsx, xls
            </div>
          </div>
          <div className="h-[60px]">
            {file && (
              <div className="flex items-center justify-between mt-[10px] cursor-pointer">
                <div className="flex items-center">
                  <span className="mr-[8px]">
                    <FileFlagIcon />
                  </span>
                  <span className="text-[var(--primary-color)] font-[400] text-[14px]">
                    {file.name}
                  </span>
                </div>
                <div>
                  <CloseIcon
                    width="10"
                    height="10"
                    onClick={handleCloseFile}
                    className="w-[10px] h-[10px] cursor-pointer mt-[4px]"
                    color="var(--primary-color)"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 justify-end">
            <CustomButton
              colorStyle="shallowGreen"
              icon="importIcon"
              onClick={onImport}
              loading={importLoading}
            >
              Employee Import Template
            </CustomButton>
            <CustomButton
              onClick={() => {
                setFile("");
                setMathFile(Math.random());
                setOpen(false);
                onClose();
              }}
              variant="outline"
            >
              Cancel
            </CustomButton>
            <CustomButton
              onClick={() => {
                handleUploadTemplate();
              }}
              loading={btnLoading}
            >
              Upload
            </CustomButton>
          </div>
        </CustomDialog>
      )}
    </>
  );
};
export default UploadFileList;

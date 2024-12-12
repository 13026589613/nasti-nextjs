import useFileUrlStore from "@/store/useFileUrlStore";

const useFileUrl = () => {
  const { getFileUrlById, fileList, setFileList } = useFileUrlStore(
    (state) => ({
      ...state,
    })
  );
  return {
    getFileUrlById,
    fileList,
    setFileList,
  };
};

export default useFileUrl;

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import useDepartmentStore from "@/store/useDepartmentStore";

const useGlobalDepartment = () => {
  const pathname = usePathname();

  const { department, getDepartmentIds } = useDepartmentStore(
    useShallow((state) => ({
      ...state,
    }))
  );

  const departmentIds: string[] = useMemo(() => {
    return getDepartmentIds(pathname) ?? [];
  }, [department, pathname]);

  return {
    departmentIds,
  };
};

export default useGlobalDepartment;

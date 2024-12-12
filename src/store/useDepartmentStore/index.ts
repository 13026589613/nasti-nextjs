"use client";
import lodash from "lodash";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UseDepartmentTypes {
  department: {
    ids: string[];
    paths: string[];
  }[];
  getDepartmentIds: (pathname: string) => string[];
  setDepartment: (ids: string[], path: string) => void;
  resetStore: () => void;
}

const useDepartmentStore = create(
  persist<UseDepartmentTypes>(
    (set, get) => ({
      department: [],
      getDepartmentIds: (pathname: string) => {
        const department = get().department;
        const result = department.find((item) => item.paths.includes(pathname));
        return result ? result.ids : [];
      },
      setDepartment: (ids: string[], path: string) => {
        const department = lodash.cloneDeep(get().department);
        const index = department.findIndex((item) => item.paths.includes(path));
        if (index > -1) {
          department[index].ids = ids;
        } else {
          department.push({
            ids,
            paths: [path],
          });
        }
        set(() => ({
          department,
        }));
      },
      resetStore: () => {
        set(() => ({
          department: [],
        }));
      },
    }),
    {
      name: "freebird-department-store",
    }
  )
);

export default useDepartmentStore;

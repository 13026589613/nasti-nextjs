import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import useAppStore from "@/store/useAppStore";

const useLayout = () => {
  const { isCollapse: isCollapseStore } = useAppStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  const handleResize = useMemo(() => {
    return () => {
      const width = window.innerWidth;
      const isCollapse = width < 990;

      const isMobile = width > 0 && width < 750;
      const isTable = width >= 750 && width < 990;

      if (!isCollapseStore) {
        useAppStore.getState().setIsShowTopSelect(width > 1350);
      } else {
        useAppStore.getState().setIsShowTopSelect(width > 1200);
      }

      useAppStore
        .getState()
        .setDevice(isMobile ? "mobile" : isTable ? "table" : "desktop");

      // If it's stowed and mobile, hide the left menu.
      if (isCollapse || isMobile) {
        useAppStore.getState().setIsCollapse(true);
      }
    };
  }, [isCollapseStore]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
};

export default useLayout;

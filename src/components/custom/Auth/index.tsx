import { useShallow } from "zustand/react/shallow";

import useAuthStore from "@/store/useAuthStore";

export default function AuthProvide({
  children,
  permissionName,
  authenticate = true,
  invert = false,
}: {
  authenticate?: boolean;
  invert?: boolean;
  permissionName: string[] | string;
  children: React.ReactNode;
}) {
  const { permission } = useAuthStore(
    useShallow((state) => ({
      ...state,
    }))
  );
  let pass = false;
  if (Array.isArray(permissionName)) {
    for (let i = 0; i < permissionName.length; i++) {
      if (permission.includes(permissionName[i])) {
        pass = true;

        break;
      }
    }
  } else {
    pass = permission.includes(permissionName);
  }

  if (authenticate) {
    if (invert) {
      return <>{!pass && children}</>;
    } else {
      return <>{pass && children}</>;
    }
  } else {
    return <>{children}</>;
  }
}

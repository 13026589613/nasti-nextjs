import { toast } from "react-toastify";

import { MESSAGE } from "@/constant/message";
import useTokenStore from "@/store/useTokenStore";

export const getErrorMessage = (
  code: number,
  url: string,
  message?: string
) => {
  if (url.includes("/pub/auth/send/mail") && code === 400) {
    // toast.error(message ? message : "error");
    return;
  }
  if (url.includes("/list/page")) {
    if (code !== 200) {
      toast.error(message ? message : MESSAGE.getListError);
    }
  } else if (url.includes("/edit")) {
    if (code !== 200) {
      toast.error(message ? message : MESSAGE.editError);
    }
  } else if (url.includes("/create")) {
    if (code !== 200) {
      toast.error(message ? message : MESSAGE.createError);
    }
  } else if (url.includes("/delete")) {
    if (code !== 200) {
      toast.error(message ? message : MESSAGE.deleteError);
    }
  } else if (code !== 200) {
    toast.error(message ? message : "error");
  }
};

export const handle401Error = (
  refreshToken: string | null | undefined,
  message?: string
) => {
  const pathname = window.location.pathname;
  const withoutToken = [
    "/login",
    "/register",
    "/forgotPassword",
    "/setPassword",
  ];
  if (refreshToken) {
    useTokenStore.getState().setAccessToken(refreshToken);
    toast.error("Token has expired and been refreshed,please try again.");
  } else {
    toast.error(message);

    if (!withoutToken.includes(pathname)) {
      setTimeout(() => {
        if (pathname !== "/login") {
          window.location.href = "/login";
        }
      }, 3 * 1000);
    }
  }
};

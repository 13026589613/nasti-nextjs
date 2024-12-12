import axios from "axios";
import { toast } from "react-toastify";

import { MESSAGE } from "@/constant/message";
import { GOOGLE_MAP_BASE_URL } from "@/constant/url";
import { apiBaseUrl } from "@/env";
import useTimeStore from "@/store/useTimeStore";
import useTokenStore from "@/store/useTokenStore";

import { getErrorMessage, handle401Error } from "./errorMessage";
import { getCancelKey } from "./utils";

const instance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 5 * 60 * 1000,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "en-US",
  },
});

const googleMapInstance = axios.create({
  baseURL: GOOGLE_MAP_BASE_URL,
  timeout: 5 * 60 * 1000,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "en-US",
  },
});

const pollingApiList = ["/api/notify/notification/unreadCount"];
let isPollingApiErrorToast = true;

const handleErrorToast = (code: number, url: string, message: string) => {
  if (pollingApiList.includes(url)) {
    isPollingApiErrorToast && getErrorMessage(code, url, message);
    isPollingApiErrorToast = false;
  } else {
    getErrorMessage(code, url, message);
  }
};

const pendingRequests = new Map<string, AbortController>();
const debounceTimeouts = new Map<string, NodeJS.Timeout>();

instance.interceptors.request.use(
  async (config) => {
    const zoneId = useTimeStore.getState().globalTimeZone;

    const accessToken = useTokenStore.getState().accessToken;
    const whiteList: string[] = [
      "/pub/",
      "/user/login",
      "/api/system/message/validate/phoneNumber4LineType/",
      "/api/system/message/validate/phoneNumber/",
      "/thirdparty/file/upload/image",
    ];
    if (
      accessToken &&
      !whiteList.some((url) => config.url && config.url.includes(url))
    ) {
      config.headers.authorization = accessToken;
    }

    if (zoneId) {
      config.headers["X-Time-Zone"] = zoneId;
    }

    // Check if debounce is explicitly set to false
    if (config.debounce === false) {
      return config;
    }

    const tokenKey = getCancelKey(config, !config.keyWithParams);

    // Clear the previous delay
    if (debounceTimeouts.has(tokenKey)) {
      clearTimeout(debounceTimeouts.get(tokenKey)!);
    }

    if (pendingRequests.has(tokenKey)) {
      pendingRequests.get(tokenKey)!.abort();
    }

    // Create a new AbortController for each request and associate it with the request configuration
    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(tokenKey, controller);

    // Setting a new delay
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        debounceTimeouts.delete(tokenKey);

        resolve(config);
      }, 300);

      // Save the timer to the map
      debounceTimeouts.set(tokenKey, timer);
    });
  },
  (error) => {
    return Promise.reject({
      code: 500,
      message: "Error",
    });
  }
);

instance.interceptors.response.use(
  (response) => {
    const { data, config } = response;

    if (config?.debounce !== false) {
      const tokenKey = getCancelKey(config, !config.keyWithParams);
      // Request complete, cancel anti-shake delayer and controller
      clearTimeout(debounceTimeouts.get(tokenKey)!);
      debounceTimeouts.delete(tokenKey);
      pendingRequests.delete(tokenKey);
    }

    if (data.code === 401) {
      data.message = "Invalid email or password";
      handle401Error(data.refreshToken);
    }

    if (
      data.code != 200 &&
      Object.prototype.toString.call(response.data) !== "[object Blob]" &&
      !config?.hideErrorMessage
    ) {
      handleErrorToast(data.code, config.url as string, data.message);
    }

    return Object.prototype.toString.call(response.data) == "[object Blob]"
      ? response
      : response.data;
  },
  async (error) => {
    const response = error.response;
    if (response) {
      let { data, config } = response;

      if (error?.config?.debounce !== false) {
        const tokenKey = getCancelKey(error.config, !config.keyWithParams);
        // Request complete, cancel anti-shake delayer and controller
        clearTimeout(debounceTimeouts.get(tokenKey)!);
        debounceTimeouts.delete(tokenKey);
        pendingRequests.delete(tokenKey);
      }

      if (data.code == 401) {
        if (data.message === "Bad credentials") {
          data.message = "Login failed, Invalid email or password";
          handle401Error(data.refreshToken, data.message);
        } else {
          handleErrorToast(data.code, config.url as string, data.message);
        }
      } else {
        handleErrorToast(data.code, config.url as string, data.message);
      }
      return response;
    } else {
      // If the request is canceled, no toast is displayed.
      if (!axios.isCancel(error)) {
        toast.error(MESSAGE.networkError, { position: "top-center" });
        return {
          code: 500,
          message: "Network Error",
        };
      } else {
        return {
          code: 500,
          message: "Cancel Error",
        };
      }
    }
  }
);

/*
  Clear all requests when logged out
*/
export const cancelAllRequests = () => {
  console.log("cancelAllRequests", pendingRequests.size);

  pendingRequests.forEach((controller, key) => {
    console.log(`Canceling request: ${key}`);
    controller?.abort();
  });

  pendingRequests.clear();

  debounceTimeouts.clear();
};

export default instance;

export { googleMapInstance };

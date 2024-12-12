import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    debounce?: boolean;
    keyWithParams?: boolean;
    // Whether to hide automatic error alerts for an interface
    hideErrorMessage?: boolean;
  }
}

export const isBrowser = () =>
  !!(
    typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
  );

export const isString = (v: unknown) => v && typeof v === "string";

export const isFunction = (v: unknown) => v && typeof v === "function";

export const isArray = (v: unknown) => v && Array.isArray(v);

export const isObject = (v: unknown) => v && typeof v === "object";

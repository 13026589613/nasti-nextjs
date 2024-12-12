export const getCancelKey = (config: any, isResponse = false) => {
  const { method, url, baseURL } = config;

  if (method === "get") {
    return isResponse
      ? `${method}-${baseURL}${url}`
      : `${method}-${baseURL}${url}${JSON.stringify(config.params)}`;
  } else {
    return isResponse
      ? `${method}-${baseURL}${url}`
      : `${method}-${baseURL}${url}${JSON.stringify(config.data)}`;
  }
};

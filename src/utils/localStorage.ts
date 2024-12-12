const setItem = (key: string, value: any) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const getItem = (key: string, isParse = true) => {
  const value = window.localStorage.getItem(key);

  if (!value) return null;

  return isParse ? JSON.parse(value) : value;
};

const removeItem = (key: string) => {
  window.localStorage.removeItem(key);
};

export { getItem, removeItem, setItem };

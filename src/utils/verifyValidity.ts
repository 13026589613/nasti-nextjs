const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^1\d{10}$/;
  return phoneRegex.test(phone);
};

export const validatePhone = (phone: string) => {
  if (!validatePhoneNumber(phone)) return false;

  return true;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex =
    /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

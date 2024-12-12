import { getCookie } from "./cookie";

export const TokenKey = "freebird-token";

export function getToken(): string | undefined {
  return getCookie(TokenKey);
}

export const formatToken = (token: string) => `Bearer ${token}`;

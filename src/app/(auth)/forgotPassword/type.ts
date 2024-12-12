export interface ForgotPasswordType {
  passWord: string;
  confirmPassWord: string;
}

export type ForgotPasswordFormType =
  | ForgotPasswordType
  | {
      email: string;
    };

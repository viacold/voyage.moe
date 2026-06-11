export type AuthRole = "admin" | "member";

export type AuthAccount = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AuthRole;
  createdAt: string;
  updatedAt: string;
};

export type AuthSessionUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
};

export type AuthRegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type AuthSignInInput = {
  email: string;
  password: string;
};

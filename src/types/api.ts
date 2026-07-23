import type { Role } from "./transaction";

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type LoginRequest = {
  email: string;
  password: string;
};

// Spec-exact login response body. Informational only — the client never
// stores these values; the real tokens travel in httpOnly cookies (AD-1).
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  user: SessionUser;
};

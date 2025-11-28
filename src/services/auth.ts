import api from "./api";
import type { ApiResponse } from "../types";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterRequest) => {
  return api.post<ApiResponse<void>>("/auth/register", data);
};

export const loginUser = async (data: any) => {
  return api.post("/auth/login", data);
};

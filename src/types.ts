export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface SubTask {
  id?: number;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export interface Task {
  id: number;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  subtasks: SubTask[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

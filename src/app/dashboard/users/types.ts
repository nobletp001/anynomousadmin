export interface User {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role: string;
  createdAt: string;
  disabled: boolean;
  withdrawalDisabled: boolean;
  taskDisabled: boolean;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminAction {
  id: number;
  username: string;
  actionType: "warning" | "deducted" | "additional" | "strike" | "not_supported";
  message: string;
  amount: number;
  referenceId: string;
  createdAt: string;
}

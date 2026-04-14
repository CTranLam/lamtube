export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  retypedPassword: string;
}

export interface UserRegisterResponseDTO {
  id: number;
  email: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  email: string;
  username: string;
  id: number;
  role: string;
}

export interface UserSummary {
  userId: number;
  email: string;
  role: string;
}

export interface UserInfo {
  id: number;
  email: string;
  role: string;
}

export interface ApiResponse<T = unknown> {
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: UserInfo | null;
  signIn: (params: { token: string; userInfo: UserInfo }) => void;
  signOut: () => void;
}

export interface UserInfoResponse {
  email: string;
  fullname: string;
  bio: string;
  avatarUrl: string;
  id?: number;
}

export interface UserInfoAdmin {
  email: string;
  fullname: string;
  bio: string;
  avatarUrl: string;
  role: string;
  id?: number;
}

export interface CategorySummary {
  id: number;
  name: string;
}

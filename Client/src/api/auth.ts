import type {
  ApiResponse,
  RegisterRequest,
  UserRegisterResponseDTO,
  LoginRequest,
  LoginResponseData,
} from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function registerUser(
  payload: RegisterRequest,
): Promise<ApiResponse<UserRegisterResponseDTO>> {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok) {
    throw new Error(body.message || "Đăng ký thất bại");
  }

  return body as ApiResponse<UserRegisterResponseDTO>;
}

export async function loginUser(
  payload: LoginRequest,
): Promise<ApiResponse<LoginResponseData>> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok) {
    throw new Error(body.message || "Đăng nhập thất bại");
  }

  return body as ApiResponse<LoginResponseData>;
}

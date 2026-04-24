import { httpFetch } from "./http";
import type {
  ApiResponse,
  RegisterRequest,
  UserRegisterResponseDTO,
  LoginRequest,
  LoginResponseData,
  ForgotPasswordRequest,
  VerifyResetOtpRequest,
  VerifyResetOtpResponseData,
  ResetPasswordRequest,
} from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function registerUser(
  payload: RegisterRequest,
): Promise<ApiResponse<UserRegisterResponseDTO>> {
  const response = await httpFetch(`${API_BASE_URL}/register`, {
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
  const response = await httpFetch(`${API_BASE_URL}/login`, {
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

export async function requestPasswordResetOtp(
  payload: ForgotPasswordRequest,
): Promise<ApiResponse<null>> {
  const response = await httpFetch(`${API_BASE_URL}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok) {
    throw new Error(body.message || "Không thể gửi mã OTP");
  }

  return body as ApiResponse<null>;
}

export async function verifyPasswordResetOtp(
  payload: VerifyResetOtpRequest,
): Promise<ApiResponse<VerifyResetOtpResponseData>> {
  const response = await httpFetch(`${API_BASE_URL}/verify-reset-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok) {
    throw new Error(body.message || "Mã OTP không hợp lệ");
  }

  return body as ApiResponse<VerifyResetOtpResponseData>;
}

export async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<ApiResponse<null>> {
  const response = await httpFetch(`${API_BASE_URL}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok) {
    throw new Error(body.message || "Không thể đổi mật khẩu");
  }

  return body as ApiResponse<null>;
}

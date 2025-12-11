// auth.model.ts

// User details returned from API
export interface UserDetails {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
}

// Auth payload stored in BehaviorSubject and sessionStorage
export interface AuthData {
  access_token: string;
  user: UserDetails;
}

// Request body for login/register
export interface AuthRequest {
  email: string;
  password: string;
  is_admin?: boolean; // optional for signup/login
}

// Response from login/register API
export interface AuthResponse {
  access_token: string;
  user: UserDetails;
  msg?: string; // optional if API returns a message
}

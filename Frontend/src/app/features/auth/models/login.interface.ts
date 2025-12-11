import {
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

export interface LoginFormValue {
    email: string;
    password: string;
    isAdmin: boolean;
}
export interface LoginRequest {
    email: string;
    password: string;
    is_admin: boolean;
}

export interface SignUpRequest {
    email: string;
    password: string;
    is_admin: boolean;
}
export interface User {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    access_token: string;
    [key: string]: any;
}

export interface LoginResponse {
    user: User;
    access_token: string;
    msg?: string;
    [key: string]: any;

}
export interface SnackBarOptions {
    duration?: number;
    horizontalPosition?: MatSnackBarHorizontalPosition;
    verticalPosition?: MatSnackBarVerticalPosition;
}


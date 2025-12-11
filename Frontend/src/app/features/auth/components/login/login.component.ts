import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { User, LoginRequest, LoginFormValue, LoginResponse, SignUpRequest } from '../../models/login.interface';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide = true;
  isLogin = true;
  user: User | null = null;
  private _snackBar = inject(MatSnackBar);

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {

  }
  ngOnInit(): void {
    this.generateForm()
  }
  generateForm() {
    this.loginForm = this.fb.group({
      email: ['test@gmail.com', [Validators.required, Validators.email]],
      password: ['test', Validators.required],
      isAdmin: [false]
    });
  }
  openSnackBar(message: any) {
    this._snackBar.open(message, '', {
      duration: 5000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
  onLogin() {
    this.authService.setAuth(null)
    if (this.loginForm.valid) {
      const formValue: LoginFormValue = this.loginForm.value;

      // Map form keys to API keys
      const reqBody: LoginRequest = {
        email: formValue.email,
        password: formValue.password,
        is_admin: formValue.isAdmin 
      };
      this.authService.logInApi(reqBody).subscribe({
        next: (res: LoginResponse) => {
          this.user = res.user;
          this.authService.setAuth(res)
          this.authService.loadAuthFromStorage()
          this.router.navigateByUrl('/');

        }
      });

    }
  }

  onSignUp() {
    this.authService.setAuth(null)
    if (this.loginForm.valid) {
      const formValue: LoginFormValue = this.loginForm.value;
      const reqBody: SignUpRequest = {
        email: formValue.email,
        password: formValue.password,
        is_admin: formValue.isAdmin
      };

      this.authService.createAccountApi(reqBody).subscribe({
        next: (res: LoginResponse) => {
          this.openSnackBar(res.msg || 'Account created');
          this.user = res.user;
          this.isLogin = true;
        }
      });
    }
  }


  toggleLoginSignup() {
    this.isLogin = !this.isLogin;
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthData, AuthRequest } from '../../models/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
    this.loadAuthFromStorage()

  }

  url = "http://127.0.0.1:5000";
  private userAuth = new BehaviorSubject<AuthData | null>(null);
  userAuth$ = this.userAuth.asObservable();





  createAccountApi(body: AuthRequest) {
    return this.http.post(`${this.url}/auth/register`, body)
  }

  logInApi(body: AuthRequest) {
    return this.http.post(`${this.url}/auth/login`, body)
  }


  loadAuthFromStorage() {
    const stored = sessionStorage.getItem('userAuth');
    if (stored) {
      this.userAuth.next(JSON.parse(stored));
    }
  }


  setAuth(data: { access_token: string, user: any }) {
    sessionStorage.setItem('userAuth', JSON.stringify(data));
    this.userAuth.next(data);
  }

  getUser() {
    return this.userAuth.value?.user || null;
  }


  getToken() {
    return this.userAuth.value?.access_token || null;
  }

  clearAuth() {
    sessionStorage.removeItem('userAuth');
    this.userAuth.next(null);
  }
}

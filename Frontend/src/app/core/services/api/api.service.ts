import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AddEventRequest } from '../../models/api.interface';


@Injectable({
  providedIn: 'root'
})
export class ApiService implements OnInit {

  constructor(private http: HttpClient, private authSerice: AuthService) {
    this.getAccessToken()

  }

  ngOnInit(): void {
    this.getAccessToken()
  }

  url = "http://127.0.0.1:5000";

  access_token: string = "";

  private categorySource = new BehaviorSubject<string>('All');
  currentCategory = this.categorySource.asObservable();

  setCategory(category: string) {
    this.categorySource.next(category);
  }


  getAccessToken() {
    if(sessionStorage.getItem('userAuth')){
      this.access_token = JSON.parse(sessionStorage.getItem('userAuth'))?.access_token
    }
  }

  addEventApi(body: AddEventRequest) {
    return this.http.post(`${this.url}/admin/events`, body, {
      headers: {
        Authorization: `Bearer ${this.access_token}`
      }
    })
  }


  fetchEvents() {
    this.getAccessToken()
    return this.http.get(`${this.url}/events`, {
      headers: {
        Authorization: `Bearer ${this.access_token}`
      }
    })
  }

  eventSignUpApi(eventId: any) {
    return this.http.post(`${this.url}/events/${eventId}/book`, {}, {
      headers: {
        Authorization: `Bearer ${this.access_token}`
      }
    })
  }

  eventUnsubscribe(eventId: number | string) {
    return this.http.post(`${this.url}/events/${eventId}/unbook`, {}, {
      headers: {
        Authorization: `Bearer ${this.access_token}`
      }
    })
  }

}

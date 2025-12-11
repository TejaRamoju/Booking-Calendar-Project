import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor() { }

  private eventsData = new Subject<any>();
  private categorySource$ = new BehaviorSubject<string>('All');
  currentCategory = this.categorySource$.asObservable();

  sendEventsData(data: any) {
    this.eventsData.next(data);
  }

  getEventsData(): Observable<any> {
    return this.eventsData.asObservable();
  }


  setCategory(category: string) {
    this.categorySource$.next(category);
  }
}

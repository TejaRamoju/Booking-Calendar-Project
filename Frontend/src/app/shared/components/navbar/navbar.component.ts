import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { NavbarUser, NavbarEvent, NavbarCategoryChangeEvent } from '../../models/nav-item.interface';
import { StateService } from 'src/app/core/services/state/state.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private router: Router, private authService: AuthService, private stateService: StateService) { }
  userDetails: NavbarUser | null = null;
  eventsData: NavbarEvent[] = [];
  ngOnInit(): void {
    this.getEventsDate()
  }

  getEventsDate(){
    this.userDetails = this.authService.getUser();
    this.stateService.getEventsData().subscribe({
      next: (res: NavbarEvent[]) => {
        this.eventsData = res.filter(
          (event, index, self) =>
            index === self.findIndex(e => e.title === event.title)
        );
        console.log("Unique events:", this.eventsData);
      }
    });
  }
  logout() {
    this.authService.clearAuth()
    console.log('User logged out');
    this.router.navigateByUrl('/login');
  }

  onCategoryChange(event: NavbarCategoryChangeEvent) {
    const selectedCategory = event.value;
    console.log('Selected category:', selectedCategory);
    this.stateService.setCategory(selectedCategory)
  }



}

import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { NavbarUser, NavbarEvent, NavbarCategoryChangeEvent } from '../../models/nav-item.interface';
import { StateService } from 'src/app/core/services/state/state.service';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private router: Router, private authService: AuthService, private stateService: StateService) { }

  private _snackBar = inject(MatSnackBar);

  userDetails: NavbarUser | null = null;
  eventsData: NavbarEvent[] = [];
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  ngOnInit(): void {
    this.getEventsDate()
  }

  openSnackBar(message: any) {
    this._snackBar.open(message, '', {
      duration: 5000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  getEventsDate() {
    this.userDetails = this.authService.getUser();
    this.stateService.getEventsData().subscribe({
      next: (res: NavbarEvent[]) => {
        this.eventsData = res.filter(
          (event, index, self) =>
            index === self.findIndex(e => e.title === event.title)
        );
        console.log("Unique events:", this.eventsData);
      },
      error: (err) => {
        this.openSnackBar(err.error.msg || 'Failed to load events');
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

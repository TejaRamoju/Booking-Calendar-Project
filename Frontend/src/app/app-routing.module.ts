import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventCalendarComponent } from './shared/components/event-calendar/event-calendar.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
// import { MiniCalendarComponent } from './mini-calendar/mini-calendar.component';

const routes: Routes = [
  { path: '', component: EventCalendarComponent, canActivate: [AuthGuard] },
  {path:"login",component:LoginComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

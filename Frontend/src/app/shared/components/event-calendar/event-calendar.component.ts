import { Component, OnInit, ViewChild, TemplateRef, inject } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api/api.service';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { StateService } from 'src/app/core/services/state/state.service';
import { CategoryEvent, UserBookedEvent, UserDetails, EventUnsubscribeResponse, EventsubscribeResponse, AddEventResponse, AddEventRequest } from '../../models/calendar.interface';
@Component({
  selector: 'app-event-calendar',
  templateUrl: './event-calendar.component.html',
  styleUrls: ['./event-calendar.component.css']
})
export class EventCalendarComponent implements OnInit {
  private _snackBar = inject(MatSnackBar);

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(private fb: FormBuilder, private dialog: MatDialog, private apiService: ApiService, private authService: AuthService, private stateService: StateService) {
    this.generateTime();
    this.createForm();
  }

  hoursList: string[] = [];
  minutesList: string[] = [];
  filteredEndHours: string[] = [];
  filteredEndMinutes: string[] = [];

  isAdmin: boolean = true;

  userDetails: UserDetails;


  userBookedEvent: UserBookedEvent;
  categoryEvents: CategoryEvent[] = []

  eventColors = {
    open: '#7F00FF',
    booked: '#228c71ff',
    closed: '#7393B3'
  };

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild('eventDialog') eventDialog!: TemplateRef<any>;
  dialogRef: MatDialogRef<any>;

  calendarOptions!: CalendarOptions;

  modalOpen = false;
  isEdit = false;

  form!: FormGroup;
  eventsData: any[] = []
  selectedEventId: number | string;

  openSnackBar(message: any) {
    this._snackBar.open(message, '', {
      duration: 5000,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  ngOnInit() {
    this.initialLoad()
  }

  initialLoad() {
    this.userDetails = this.authService.getUser()

    this.stateService.currentCategory.subscribe(category => {
      this.filterEventsByCategory(category);
    });

    this.hoursList = Array.from({ length: 24 }, (_, i) =>
      (i + 1).toString().padStart(2, '0')
    );

    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      selectable: true,
      editable: true,
      eventDisplay: 'block',

      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek'
      },

      events: [],

      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventDrop: this.saveFromCalendar.bind(this),
      eventResize: this.saveFromCalendar.bind(this),
      eventContent: this.renderEventContent.bind(this),

      eventDidMount: (info) => {
        if (!info.event.extendedProps["booked"] && !info.event.extendedProps["user"]) {
          info.el.style.backgroundColor = this.eventColors.open;
          info.el.style.borderColor = this.eventColors.open;
        }
        else if (info.event.extendedProps["booked"] && (info.event.extendedProps["bookedById"] == this.userDetails.id)) {
          info.el.style.backgroundColor = this.eventColors.booked;
          info.el.style.borderColor = this.eventColors.booked;
        }
        else {
          info.el.style.backgroundColor = this.eventColors.closed;
          info.el.style.borderColor = this.eventColors.closed;
        }
      }
    };

    this.reloadCalendar();
  }

  reloadCalendar() {
    this.apiService.fetchEvents().subscribe({
      next: (res: any) => {
        this.eventsData = res.map((event: any) => ({
          ...event,
          start: new Date(event.start).toISOString(),
          end: new Date(event.end).toISOString()
        })
        );
        this.categoryEvents = res.filter(
          (event, index, self) =>
            index === self.findIndex(e => e.title === event.title)
        );
        this.stateService.sendEventsData(this.eventsData)

        const calendarApi = this.calendarComponent.getApi();

        calendarApi.removeAllEvents();

        this.eventsData.forEach(event => {
          calendarApi.addEvent(event);
        });
      },
      error: (err) => {
        this.openSnackBar(err.error.msg || 'Events failed to load');
      }
    });
  }

  renderEventContent(eventInfo: any) {
    const container = document.createElement('div');
    container.classList.add('custom-event');

    const category = eventInfo.event._def.title || '';

    const randomName = eventInfo.event.extendedProps.user || '';

    container.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      gap: 6px;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 13px;
        font-weight: 550;
        color: #F9FAFB;
      "><span class="ms-1">📅</span
        <span class="event-title ">${category}</span>
      </div>

      <div style="
        display: flex;
        align-items: center;
        gap: 3px;
        color: #FFFFFF;
        font-size: 12px;
      ">

        ${randomName && this.userDetails.is_admin ? `
           <div class="ms-1" style="
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #2563EB;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          flex-shrink: 0;
        ">
          ${randomName[0] || ""}
        </div>
          `: ""
      }


        <!--USER NAME -->
        <span>${this.userDetails.is_admin ? randomName : ""}</span>
      </div>

    </div>
  `;

    return { domNodes: [container] };
  }

  // Add new event
  handleDateSelect(selectInfo: DateSelectArg) {

    if (!this.userDetails.is_admin) return;

    this.isEdit = false;

    const startDate = new Date(selectInfo.start);

    // Auto set end date = start date + 1 hour
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    this.form.patchValue({
      id: '',
      title: '',
      allDay: selectInfo.allDay,

      startHour: startDate.getHours().toString().padStart(2, '0'),
      startMinute: startDate.getMinutes().toString().padStart(2, '0'),

      endHour: endDate.getHours().toString().padStart(2, '0'),
      endMinute: endDate.getMinutes().toString().padStart(2, '0'),

      endDate: endDate
    });

    this.openDialog();
    this.onStartTimeChange()
  }



  openDialog() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    this.dialogRef = this.dialog.open(this.eventDialog, {
      width: (screenWidth * 0.4) + 'px',
      // height: (screenHeight * 0.5) + 'px',
    });
  }

  handleEventClick(clickInfo: EventClickArg) {
    const e = clickInfo.event;
    this.selectedEventId = e.id;
    if (
      this.userDetails?.is_admin ||
      (e.extendedProps?.['bookedById'] && e.extendedProps['bookedById'] !== this.userDetails?.id)
    ) {
      return;
    }


    this.userBookedEvent = {
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end,
      booked: e.extendedProps['booked'],
    }

    this.isEdit = true;
    const start = new Date(e.start!);

    this.form.patchValue({
      id: e.id,
      title: e.title,
      allDay: e.allDay,
      startHour: start.getHours().toString().padStart(2, '0'),
      startMinute: start.getMinutes().toString().padStart(2, '0'),
      endDate: start
    });

    this.modalOpen = true;
    this.openDialog();
  }

  saveEvent() {
    if (!this.userDetails.is_admin) {

    }
    if (this.form.invalid) {
      alert('Form invalid');
      return;
    }

    const v = this.form.value;

    const start = new Date(v.endDate);
    start.setHours(+v.startHour, +v.startMinute);

    const end = new Date(v.endDate);
    end.setHours(+v.endHour, +v.endMinute);

    const calendarApi = this.calendarComponent.getApi();

    if (this.isEdit) {
      const existingEvent = calendarApi.getEventById(v.id);
      if (existingEvent) {
        existingEvent.setProp('title', v.title);
        existingEvent.setStart(start);
        existingEvent.setEnd(end);
        existingEvent.setAllDay(v.allDay);
      }
    } else {
      calendarApi.addEvent({
        id: Date.now().toString(),
        title: v.title,
        start: start,
        end: end,
        allDay: v.allDay
      });
    }

    const reqBody = {
      title: v.title,
      start: this.formatDateForApi(start),
      end: this.formatDateForApi(end)
    };

    this.addEvent(reqBody);
    this.saveFromCalendar();
    this.closeModal();
  }


  deleteEvent() {
    const calendarApi = this.calendarComponent.getApi();
    const event = calendarApi.getEventById(this.form.value.id);
    if (event) {
      event.remove();
      this.saveFromCalendar();
    }
    this.closeModal();
  }

  saveFromCalendar() {
    const calendarApi = this.calendarComponent.getApi();
    const events = calendarApi.getEvents().map(e => ({
      id: e.id,
      title: e.title,
      start: e.startStr,
      end: e.endStr,
      allDay: e.allDay
    }));
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }

  getEventsFromStorage() {
    const data = localStorage.getItem('calendarEvents');
    return data ? JSON.parse(data) : [];
  }

  closeModal() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onStartTimeChange() {
    const startHour = parseInt(this.form.get('startHour')?.value || '0');
    const startMinute = parseInt(this.form.get('startMinute')?.value || '0');

    const endHour = parseInt(this.form.get('endHour')?.value || '0');
    const endMinute = parseInt(this.form.get('endMinute')?.value || '0');


    this.filteredEndHours = this.hoursList.filter(h => parseInt(h) >= startHour);



    if (endHour === startHour) {
      this.filteredEndMinutes = this.minutesList.filter(m => parseInt(m) > startMinute);
    }
    if (endHour !== startHour) {
      this.filteredEndMinutes = [...this.minutesList];
    }
    if (endHour == startHour && startMinute >= 55) {

      const newEndHour = startHour + 1;

      this.form.patchValue({
        endHour: newEndHour.toString().padStart(2, '0'),
        endMinute: '00'
      });

      this.filteredEndHours = this.hoursList.filter(h => parseInt(h) >= newEndHour);

      this.filteredEndMinutes = [...this.minutesList];
    }

    if (
      endHour < startHour ||
      (endHour === startHour && endMinute <= startMinute)
    ) {
      this.form.patchValue({
        endHour: startHour.toString().padStart(2, '0'),
        endMinute: (startMinute + 1).toString().padStart(2, '0')
      });
    }
  }


  generateTime() {
    this.hoursList = Array.from({ length: 24 }, (_, i) =>
      i.toString().padStart(2, '0')
    );

    this.minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    this.filteredEndHours = [...this.hoursList];
    this.filteredEndMinutes = [...this.minutesList];
  }

  createForm() {
    this.form = this.fb.group({
      id: [''],
      title: ['', Validators.required],
      allDay: [false],

      startHour: ['', Validators.required],
      startMinute: ['', Validators.required],

      endHour: ['', Validators.required],
      endMinute: ['', Validators.required],

      endDate: [new Date(), Validators.required]
    });
  }

  filterEventsByCategory(category: string) {
    const calendarApi = this.calendarComponent.getApi();

    // Remove all existing events
    calendarApi.removeAllEvents();

    // Filter events
    const filteredEvents = this.eventsData.filter(event => {
      if (!category || category === 'All') return true;
      return event.title === category;
    });

    // Add filtered events back to calendar
    filteredEvents.forEach(event => {
      calendarApi.addEvent(event);
    });
  }

  addEvent(reqBody: AddEventRequest) {
    this.apiService.addEventApi(reqBody).subscribe({
      next: (res: AddEventResponse) => {
        this.openSnackBar(res?.msg)
        this.closeModal()
        this.reloadCalendar();
      },
      error: (err) => {
        this.openSnackBar(err.error.msg || 'Event failed to add');
      }
    })
  }

  formatDateForApi(date: Date): string {
    const y = date.getFullYear();
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const d = ('0' + date.getDate()).slice(-2);
    const h = ('0' + date.getHours()).slice(-2);
    const min = ('0' + date.getMinutes()).slice(-2);
    const s = ('0' + date.getSeconds()).slice(-2);

    return `${y}-${m}-${d}T${h}:${min}:${s}`;
  }

  eventSignUp() {
    this.apiService.eventSignUpApi(this.selectedEventId).subscribe({
      next: (res: EventsubscribeResponse) => {
        this.openSnackBar(res?.msg)
        this.closeModal()
        this.reloadCalendar();
      },
      error: (err) => {
        this.openSnackBar(err.error.msg || 'Sign Up failed');
      }
    })
  }

  eventUnSubscribe(id: number | string) {
    this.apiService.eventUnsubscribe(id).subscribe({
      next: (res: EventUnsubscribeResponse) => {
        this.openSnackBar(res?.msg)
        this.closeModal()
        this.reloadCalendar();
      },
      error: (err) => {
        this.openSnackBar(err.error.msg || 'Unsubscribe failed');
      }
    })
  }

}

import { AfterViewInit, Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HttpClientModule, FullCalendarModule, FormsModule, CommonModule],
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit, AfterViewInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  isMobile = false;
  showModal: boolean = false;
  modalData = {
    title: '',
    startTime: '',
    endTime: '',
    selectedDate: '',
    email: ''
  };

  events: EventInput[] = [];
  eventCollection: AngularFirestoreCollection<EventInput>;

  calendarOptions: CalendarOptions = {
    plugins: [
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin,
      listPlugin,
      bootstrapPlugin
    ],
    initialView: 'dayGridMonth',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,list'
    },
    buttonText: {
      today: 'Today',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      list: 'List'
    },
    nowIndicator: true,
    selectable: true,
    editable: true,
    navLinks: true,
    eventTextColor: 'white',
    themeSystem: 'bootstrap4',
    eventBackgroundColor: 'blue',
    events: this.events,
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this)
  };

  constructor(private http: HttpClient, private afs: AngularFirestore) {
    this.eventCollection = this.afs.collection<EventInput>('events');
  }

  ngOnInit(): void {
    this.loadEventsFromFirestore();
  }

  ngAfterViewInit() {
    this.checkScreenWidth();
    window.addEventListener('resize', this.checkScreenWidth.bind(this));
  }

  loadEventsFromFirestore() {
    this.eventCollection.valueChanges().subscribe((events) => {
      this.events = events;
      this.calendarOptions.events = this.events;
    });
  }

  fetchAvailableSlots(): Observable<EventInput[]> {
    return this.http.get<EventInput[]>('http://localhost:3000/events')
      .pipe(
        catchError((err) => {
          console.error('Error:', err);
          return of([]); // Return empty array on error
        })
      );
  }

  handleDateClick(arg: any) {
    const clickedDate = new Date(arg.date);
    
    // Prevent event creation on weekends
    if (clickedDate.getDay() === 0 || clickedDate.getDay() === 6) {
      alert('Event creation is not allowed on weekends.');
      return;
    }
  
    // Open the modal with the clicked date for event creation
    this.modalData = {
      title: '',
      startTime: '',
      endTime: '',
      selectedDate: arg.dateStr,
      email : ''
    };
    this.showModal = true;
  }

  handleEventClick(arg: any) {
    const eventId = arg.event.id;

    // Pre-fill modal data with the clicked event details
    this.modalData = {
      title: arg.event.title,
      startTime: arg.event.startStr.split('T')[1].substring(0, 5),  // Extract time from startStr
      endTime: arg.event.endStr.split('T')[1].substring(0, 5),      // Extract time from endStr
      selectedDate: arg.event.startStr.split('T')[0],  // Store the date part
      email: arg.event.email
    };

    // Open the modal with pre-filled event data for editing
    this.showModal = true;
  }

  isValidTimeFormat(time: string): boolean {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  }

  checkScreenWidth() {
    this.isMobile = window.innerWidth < 768;
  }

  closeModal(): void {
    this.showModal = false; // Close the modal by changing the visibility flag
  }

  createEventInCalendar(event: any) {
    const newEvent: EventInput = {
      title: event.title,
      start: `${event.selectedDate}T${event.startTime}:00`,
      end: `${event.selectedDate}T${event.endTime}:00`,
      allDay: false,
      backgroundColor: 'blue',
      extendedProps: { email: event.email }
    };

    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.addEvent(newEvent);
      this.events.push(newEvent);
      this.saveEventToFirestore(newEvent);
      console.log('Event successfully added to the calendar:', newEvent);
    }
  }

  sendEventEmail(event: any) {
    console.log('Sending event email to:', event.email);
  }

  onSubmit(): void {
    const newEvent = {
      title: this.modalData.title,
      startTime: this.modalData.startTime,
      endTime: this.modalData.endTime,
      selectedDate: this.modalData.selectedDate,
      email: this.modalData.email
    };

    console.log(newEvent, "newEventsubmit"),
    this.createEventInCalendar(newEvent);
    this.sendEventEmail(newEvent);
    console.log('Event created:', this.modalData);
    this.closeModal();
  }

  clearEvents() {
    this.eventCollection.ref.get().then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        this.eventCollection.doc(doc.id).delete();
      });
    });
    this.events = [];
    this.calendarOptions.events = this.events;
  }

  saveEventToFirestore(event: EventInput) {
    this.eventCollection.add(event);
  }
}
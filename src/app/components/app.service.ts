import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { EventInput } from '@fullcalendar/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private eventsCollection: AngularFirestoreCollection<EventInput>;

  constructor(private angularFirestore: AngularFirestore) {
    // Initialize the Firestore collection
    this.eventsCollection = this.angularFirestore.collection<EventInput>('events');
  }

  // Add an event to Firestore
  addEvent(eventData: EventInput): Promise<DocumentReference> {
    return this.eventsCollection.add(eventData);
  }

  // Fetch all events from Firestore
  getEvents(): Observable<EventInput[]> {
    return this.eventsCollection.snapshotChanges().pipe(
      map(actions => 
        actions.map(a => {
          const data = a.payload.doc.data() as EventInput;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      ),
      catchError((error) => {
        console.error('Error fetching events:', error);
        return of([]); // Return empty array if there is an error
      })
    );
  }

  // Fetch available slots (events) or any other relevant data
  fetchAvailableSlots(): Observable<EventInput[]> {
    return this.getEvents().pipe(
      catchError((err) => {
        console.error('Error fetching available slots:', err);
        return of([]); // Return empty array on error
      })
    );
  }

  // Update event in Firestore (if necessary)
  updateEvent(eventId: string, eventData: EventInput): Promise<void> {
    return this.eventsCollection.doc(eventId).update(eventData);
  }

  // Delete event from Firestore
  deleteEvent(eventId: string): Promise<void> {
    return this.eventsCollection.doc(eventId).delete();
  }
}
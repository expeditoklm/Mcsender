// services/message.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, MessageStatus } from '../models/Message';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
      private apiUrl = `${environment.apiUrl}messages`;
    

  constructor(private http: HttpClient) {}

  getAllMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}`);
  }

  getMessageById(id: number): Observable<Message> {
    return this.http.get<Message>(`${this.apiUrl}/${id}`);
  }

  createMessage(message: Partial<Message>): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}`, message);
  }

  updateMessage(id: number, message: Partial<Message>): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/${id}`, message);
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMessagesByStatus(status: MessageStatus): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/status`, { params: { status } });
  }

  scheduleMessage(data: { messageId: number; scheduledDate: Date }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/schedule`, data);
  }

  retryFailedMessages(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/retry`, {});
  }

  findMessagesByCampaign(campaignId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/campaign/${campaignId}`);
  }
}

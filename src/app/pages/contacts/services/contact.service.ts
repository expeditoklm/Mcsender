import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateContactDto } from '../models/CreateContactDto';
import { UpdateContactDto } from '../models/UpdateContactDto';
import { FindContactByEmailDto } from '../models/FindContactByEmailDto';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}contacts`;

  constructor(private http: HttpClient) {}

  // Créer un nouveau contact
  createContact(contact: CreateContactDto): Observable<any> {
    return this.http.post(`${this.apiUrl}`, contact, this.getHttpOptions());
  }

  // Obtenir tous les contacts
  getAllContacts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, this.getHttpOptions());
  }

  // Obtenir un contact par ID
  getContactById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

 

  // Mettre à jour un contact
  updateContact(id: number, contact: UpdateContactDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, contact, this.getHttpOptions());
  }

  // Supprimer un contact
  deleteContact(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  // Obtenir toutes les audiences associées à un contact
  getAudiencesByContact(contactId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${contactId}/audiences`, this.getHttpOptions());
  }

  // Obtenir tous les messages associés à un contact
  getMessagesByContact(contactId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${contactId}/messages`, this.getHttpOptions());
  }

  // Recherche de contact par email, téléphone ou nom
  searchContact(query: FindContactByEmailDto): Observable<any[]> {
    const params = {
      email: query.email || '',
      name: query.name || '',
      username: query.username || '',
      phone: query.phone || '',
    };

    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params,
      headers: this.getHttpOptions().headers,
    });
  }

  // Obtenir les messages associés à un contact dans une audience et filtrés par campagne et/ou canal
  getMessagesByContactAudienceCampaignChannel(
    contactId: number,
    audienceId: number,
    campaignId?: string,
    channelId?: string
  ): Observable<any[]> {
    const params = {
      campaignId: campaignId || '',
      channelId: channelId || '',
    };

    return this.http.get<any[]>(
      `${this.apiUrl}/${contactId}/audiences/${audienceId}/messages`,
      { params, headers: this.getHttpOptions().headers }
    );
  }

  // Options HTTP
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // Ajoutez un token d'authentification si nécessaire
        // 'Authorization': `Bearer ${this.authService.getToken()}`,
      }),
    };
  }
}

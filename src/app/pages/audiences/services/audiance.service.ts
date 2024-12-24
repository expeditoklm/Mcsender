import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Audience } from '../models/Audience';
import { UpdateAudienceDto } from '../models/UpdateAudienceDto';
import { AddContactToAudienceDto } from '../models/AddContactToAudienceDto';


@Injectable({
  providedIn: 'root',
})
export class AudienceService {
  private apiUrl = `${environment.apiUrl}audiences`;

  constructor(private http: HttpClient) {}

  // Créer une nouvelle audience
  createAudience(audience: Audience): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { ...audience}, this.getHttpOptions());
  }

  // Obtenir toutes les audiences
  getAllAudiences(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // Obtenir une audience par son ID
  getAudienceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Mettre à jour une audience
  updateAudience(id: number, audience: UpdateAudienceDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, audience, this.getHttpOptions());
  }

  // Supprimer une audience par ID
  deleteAudience(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  // Obtenir les messages d'une audience spécifique
  getMessagesByAudience(audienceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${audienceId}/messages`);
  }

  // Obtenir les contacts d'une audience spécifique
  getContactsByAudience(audienceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${audienceId}/contacts`);
  }

  // Ajouter un contact à une audience
  addContactToAudience(dto: AddContactToAudienceDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-contact`, dto, this.getHttpOptions());
  }

  // Associer un tableau de contacts à une audience
  associateContacts(audienceId: number, contacts: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${audienceId}/contacts`, contacts, this.getHttpOptions());
  }

  // Télécharger et associer des contacts via un fichier
  uploadContacts(audienceId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/${audienceId}/upload`, formData);
  }

  // Options HTTP
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Channel } from '../models/Channel';
import { UpdateChannelDto } from '../models/UpdateChannelDto';
import { AddTemplateTypeToChannelDto } from '../models/AddTemplateTypeToChannelDto';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private apiUrl = `${environment.apiUrl}channels`;  // URL de l'API des canaux

  constructor(private http: HttpClient) {}

  // Créer un nouveau canal
  createChannel(channel: Channel): Observable<any> {
    return this.http.post(`${this.apiUrl}`, channel, this.getHttpOptions());
  }

  // Obtenir tous les canaux
  getAllChannels(): Observable<Channel[]> {
    return this.http.get<{ message: string; channels: Channel[] }>(this.apiUrl).pipe(
      map(response => response.channels)
    );
  }

  // Obtenir un canal par ID
  getChannelById(id: number): Observable<Channel> {
    return this.http.get<Channel>(`${this.apiUrl}/${id}`);
  }

  // Mettre à jour un canal
  updateChannel(id: number, channel: UpdateChannelDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, channel, this.getHttpOptions());
  }

  // Ajouter un modèle de type à un canal
  addTemplateTypeToChannel(id: number, template: AddTemplateTypeToChannelDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/template`, template, this.getHttpOptions());
  }

  // Supprimer un canal
  removeChannel(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHttpOptions());
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

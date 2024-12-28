import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTemplateType } from '../models/CreateTemplateType';
import { UpdateTemplateType } from '../models/UpdateTemplateType';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TemplateTypeService {
  private apiUrl = `${environment.apiUrl}templateTypes`;

  constructor(private http: HttpClient) {}

  // Créer un nouveau type de modèle
  createTemplateType(createTemplateType: CreateTemplateType): Observable<any> {
    return this.http.post(`${this.apiUrl}`, createTemplateType, this.getHttpOptions());
  }

  // Obtenir tous les types de modèles
  getAllTemplateTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHttpOptions());
  }

  // Obtenir un type de modèle par ID
  getTemplateTypeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  // Mettre à jour un type de modèle
  updateTemplateType(id: number, updateTemplateType: UpdateTemplateType): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, updateTemplateType, this.getHttpOptions());
  }

  // Supprimer un type de modèle
  deleteTemplateType(id: number): Observable<any> {
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

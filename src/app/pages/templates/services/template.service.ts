import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTemplate } from '../models/CreateTemplate';
import { UpdateTemplate } from '../models/UpdateTemplate';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  private apiUrl = `${environment.apiUrl}templates`;

  constructor(private http: HttpClient) {}

  // Créer un nouveau template
  createTemplate(createTemplate: CreateTemplate): Observable<any> {
    return this.http.post(`${this.apiUrl}`, createTemplate, this.getHttpOptions());
  }

  // Obtenir tous les templates
  getAllTemplates(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHttpOptions());
  }

  // Obtenir un template par ID
  getTemplateById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  // Mettre à jour un template
  updateTemplate(id: number, updateTemplate: UpdateTemplate): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, updateTemplate, this.getHttpOptions());
  }

  // Supprimer un template
  deleteTemplate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  // Appliquer un template à une campagne
  applyTemplateToCampaign(templateId: number, campaignId: number): Observable<any> {
    const body = { templateId, campaignId };
    return this.http.post(`${this.apiUrl}/apply`, body, this.getHttpOptions());
  }

  // Prévisualiser un template
  previewTemplate(templateId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/preview/${templateId}`, this.getHttpOptions());
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

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { CampaignDto } from '../models/campaign';
import { UpdateCampaignDto } from '../models/updateCampaignDto';
import { ExtendCampaignDto } from '../models/extendCampaignDto';
import { FindCampaignsByStatusDto } from '../models/findCampaignsByStatusDto';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class CampaignService {
    private apiUrl = `${environment.apiUrl}campaigns`;

  constructor(private http: HttpClient) {}

  // Créer une nouvelle campagne
  createCampaign(campaign: CampaignDto): Observable<any> {
    return this.http.post(`${this.apiUrl}`, campaign, this.getHttpOptions())
    ;
  }

  // Obtenir toutes les campagnes
  getAllCampaigns(): Observable<CampaignDto[]> {
    return this.http.get<{ message: string; campaigns: CampaignDto[] }>(this.apiUrl).pipe(
      map(response => response.campaigns)
    );
  }

    // Mettre à jour une campagne existante
    findOne(id: number): Observable<any> {
      return this.http.get(`${this.apiUrl}/${id}`);
    }
  
  
  // Mettre à jour une campagne existante
  updateCampaign(id: number, campaign: UpdateCampaignDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, campaign, this.getHttpOptions());
  }

  // Prolonger une campagne
  extendCampaign(id: number, dto: ExtendCampaignDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/extend/${id}`, dto, this.getHttpOptions())
    
    ;
  }

  // Annuler une campagne
  cancelCampaign(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cancel/${id}`, {});
  }

  // Récupérer les campagnes par statut
  getCampaignsByStatus(dto: FindCampaignsByStatusDto): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status/${dto.status}`).pipe(
      retry(1),
    );
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

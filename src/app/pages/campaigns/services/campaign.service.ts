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
    return this.http.post(`${this.apiUrl}`, campaign, this.getHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  // Obtenir toutes les campagnes
  getAllCampaigns(): Observable<CampaignDto[]> {
    return this.http.get<{ message: string; campaigns: CampaignDto[] }>(this.apiUrl).pipe(
      map(response => response.campaigns)
    );
  }
  
  // Mettre à jour une campagne existante
  updateCampaign(id: number, campaign: UpdateCampaignDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, campaign, this.getHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  // Prolonger une campagne
  extendCampaign(id: number, dto: ExtendCampaignDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/extend/${id}`, dto, this.getHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  // Annuler une campagne
  cancelCampaign(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cancel/${id}`, {}, this.getHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer les campagnes par statut
  getCampaignsByStatus(dto: FindCampaignsByStatusDto): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status/${dto.status}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Gestion des erreurs
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      errorMessage = `Erreur ${error.status}: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
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

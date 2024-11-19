import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../users/models/user';

// Interfaces existantes...
export interface AssociateUserToCompaniesDto {
    userId: number;
    companyIds: number[];
  }
@Injectable({
  providedIn: 'root'
})
export class UserCompanyService {
  private baseUrl = `${environment.apiUrl}user-company`;
  private headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  getAllCompanyForUser(userId: number): Observable<any> {
    // Utilisez 'company/:userId' comme dans le contrôleur
    return this.http.get<any>(`${this.baseUrl}/company/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }



  // New method to associate user to companies
  associateUserToCompanies(dto: AssociateUserToCompaniesDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/associate`, dto, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }



  // Méthode utilitaire pour gérer les erreurs (à utiliser avec catchError de rxjs)
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.status === 0) {
      // Erreur côté client ou problème réseau
      console.error('Une erreur est survenue:', error.error);
      errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    } else {
      // Le backend a retourné un code d'erreur
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
      errorMessage = error.error?.message || 'Une erreur est survenue sur le serveur.';
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Méthode pour ajouter le token JWT aux headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }
}
// modal.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreateCompanyDto } from '../models/createCompanyDto';
import { Company } from '../models/company';
import { UpdateCompanyDto } from '../models/updateCompanyDto';
import { ActivateCompanyDto } from '../models/activateCompanyDto';

@Injectable({
  providedIn: 'root'
})
export class CompanyService { 
  private apiUrl = `${environment.apiUrl}companies`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // Fonction pour créer une entreprise
  createCompany(createCompanyDto: CreateCompanyDto): Observable<Company> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Company>(this.apiUrl, createCompanyDto, { headers }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Fonction pour mettre à jour une entreprise
  updateCompany(id: number, updateCompanyDto: UpdateCompanyDto): Observable<Company> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<Company>(`${this.apiUrl}/${id}`, updateCompanyDto, { headers }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Fonction pour obtenir toutes les entreprises
  getAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Fonction pour obtenir une entreprise par ID
  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Fonction pour supprimer une entreprise
  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Fonction pour activer une entreprise
  activateCompany(activateCompanyDto: ActivateCompanyDto): Observable<Company> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Company>(`${this.apiUrl}/activate`, activateCompanyDto, { headers }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Gestion des erreurs
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur : ${error.status}\nMessage : ${error.message}`;
    }
    return throwError(errorMessage);
  }
}

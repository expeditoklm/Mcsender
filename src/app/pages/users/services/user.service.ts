import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../users/models/user';

// Interfaces pour les DTOs
export interface CreateUserDto {
  id?: string;
  name?: string;
  username?: string;
  email: string;
  role: string;
  password: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}

export interface CreateUserCompanyDto {
  user_id: number;
  company_id: number;
  isMember?: boolean;
}

export interface UpdateUserCompanyDto extends Partial<CreateUserCompanyDto> {}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}users`;
  private headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // Créer un nouvel utilisateur
  create(createUserDto: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.baseUrl, createUserDto, { headers: this.headers })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Récupérer tous les utilisateurs
  findAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl, { headers: this.headers })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Récupérer un utilisateur par son ID
  findOne(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`, { headers: this.headers })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Mettre à jour un utilisateur
  update(id: number, updateUserDto: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, updateUserDto, { headers: this.headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Supprimer un utilisateur
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Créer une association utilisateur-entreprise
  createUserCompany(createUserCompanyDto: CreateUserCompanyDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/company`, createUserCompanyDto, { headers: this.headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Mettre à jour une association utilisateur-entreprise
  updateUserCompany(
    userId: number, 
    companyId: number, 
    updateUserCompanyDto: UpdateUserCompanyDto
  ): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/company/${userId}/${companyId}`, 
      updateUserCompanyDto, 
      { headers: this.headers }
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

  // Méthode pour ajouter le token JWT aux headers (à utiliser si nécessaire)
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  // Exemple d'utilisation des headers avec authentification
  findAllWithAuth(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl, { 
      headers: this.getAuthHeaders() 
    });
  }
}
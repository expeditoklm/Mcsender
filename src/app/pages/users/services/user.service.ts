import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, Observable, retry, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../users/models/user';
import { CreateUserCompanyDto, UpdateUserCompanyDto } from '../models/UserCompanyDto';
import { QueryClient, QueryObserver } from '@tanstack/query-core';

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




@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}users`;
  private headers = new HttpHeaders().set('Content-Type', 'application/json');
  private queryClient: QueryClient;
  constructor(
    private http: HttpClient,
    private router: Router
  ) {   this.queryClient = new QueryClient(); }



  createUsersQueryObserver(queryParams: {
    pageIndex: number;
    pageSize: number;
    searchName: string;
    searchUserName: string;
    searchEmail: string;
    searchRole: string;
  }) {
    return new QueryObserver<any, Error>(this.queryClient, {
      queryKey: [
        'usersList',
        queryParams.pageIndex,
        queryParams.pageSize,
        queryParams.searchName,
        queryParams.searchUserName,
        queryParams.searchEmail,
        queryParams.searchRole,
      ],
      queryFn: async (): Promise<any> => {
        const filters = {
          searchName: queryParams.searchName,
          searchUserName: queryParams.searchUserName,
          searchEmail: queryParams.searchEmail,
          searchRole: queryParams.searchRole,
        };

        try {
          let params = new HttpParams()
            .set('page', queryParams.pageIndex.toString())
            .set('pageSize', queryParams.pageSize.toString());

          if (filters.searchName) {
            params = params.set('searchName', filters.searchName);
          }
          if (filters.searchUserName) {
            params = params.set('searchUserName', filters.searchUserName);
          }
          if (filters.searchEmail) {
            params = params.set('searchEmail', filters.searchEmail);
          }
          if (filters.searchRole) {
            params = params.set('searchRole', filters.searchRole);
          }

          const response = await firstValueFrom(
            this.http.get<any>(this.baseUrl, { params })
          );

          return {
            data: response.data,
            total: response.total,
          };
        } catch (error) {
          console.error('Error in queryFn:', error);
          throw new Error('Invalid data format received');
        }
      },
    });
  }

  // Créer un nouvel utilisateur
  create(createUserDto: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.baseUrl, createUserDto, { headers: this.headers })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Récupérer tous les utilisateurs
  findAll(page: number, pageSize: number, filters: any): Observable<User[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
      if (filters.searchName) {
        params = params.set('searchName', filters.searchName);
      }
      if (filters.searchUserName) {
        params = params.set('searchUserName', filters.searchUserName);
      }
      if (filters.searchEmail) {
        params = params.set('searchEmail', filters.searchEmail);
      }
      if (filters.searchRole) {
        params = params.set('searchRole', filters.searchRole);
      }


/*************  ✨ Codeium Command ⭐  *************/
  /**
   * Constructor.
   * Initialize the query observer.
   * @param http The HttpClient injected.
   * @param router The Router injected.
   * @param queryClient The QueryClient injected.
   */
/******  89e23e40-6d03-4fb8-9e97-598c637d23e5  *******/    return this.http.get<User[]>(this.baseUrl,  { params})
      .pipe(
        retry(1),
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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../users/models/user';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient, private router: Router) {}

  private registerUrl = `${environment.apiUrl}auth/signin`;

  signIn(userDto: User) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.registerUrl, userDto, { headers });
  }

  // Fonction pour décoder le JWT et extraire les données
  public decodeJWT(token: any) {
    try {
      const payloadBase64 = token.split(".")[1];
      const decodedPayload = atob(payloadBase64);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error("Erreur lors du décodage du JWT :", error);
      return null;
    }
  }

  // Fonction pour extraire l'ID de l'utilisateur
  getUserId() {
    const token = sessionStorage.getItem("user_session_token");
    if (!token) {
      console.warn("Aucun token trouvé.");
      return null;
    }

    const payload = this.decodeJWT(token);
    return payload ? payload.id : null;
  }
}

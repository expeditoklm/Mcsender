import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../pages/login/services/login.service';
import { tap } from 'rxjs';

export const loggerInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router); // Injection du routeur
  const loginService = inject(LoginService); // Injection du service de login
  const token = sessionStorage.getItem('user_session_token'); // Récupérer le token

  // Vérification de l'expiration du token
  if (token) {
    const payload = loginService.decodeJWT(token);
    const currentTime = Math.floor(Date.now() / 1000); // Temps actuel en secondes

    if (payload && payload.exp <= currentTime) {
      sessionStorage.removeItem('user_session_token'); // Supprimer le token expiré
      router.navigate(['/login']); // Rediriger vers la page de connexion
      return next(req); // Stopper la requête ici si nécessaire
    }

    // Ajouter le header Authorization
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    tap({
      error: (err:any) => {
        if (err.status === 401) {
          sessionStorage.removeItem('user_session_token'); // Supprimer le token
          router.navigate(['/login']); // Rediriger vers la page de connexion
        }
      },
    })
  );
};

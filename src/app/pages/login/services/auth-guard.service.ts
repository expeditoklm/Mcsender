import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LoginService } from './login.service';
import { NavigationService } from './navigation.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate  {
  constructor(
    private router: Router,
    private loginService: LoginService,
    private navigationService: NavigationService
  ) {}

  canActivate( next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    // Récupérer le token depuis le sessionStorage
    const token = sessionStorage.getItem('user_session_token');

    if (token) {
      // Décoder le token pour vérifier la date d'expiration
      const payload = this.loginService.decodeJWT(token);

      if (payload && payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000); // Obtenir le temps actuel en secondes
        if (payload.exp > currentTime) {
          // Le token est valide
          return true;
        }
      }
    }
  console.log('Token invalide ou expiré. Redirection vers /login.');
    sessionStorage.removeItem('user_session_token');
    this.navigationService.clearPreviousUrl(); // Clear any old route
    this.navigationService.previousUrl = state.url; // Memorize the current route
    this.router.navigate(['/login']);
    return false;
  }
}


@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(private router: Router, private loginService: LoginService) {}

  canActivate(): boolean {
    const isAuthenticated = !!this.loginService.getUserId();
    if (isAuthenticated) {
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      return true;
    }
  }
}
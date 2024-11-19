import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private loginService: LoginService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const idUser = this.loginService.getUserId();

    // Si l'utilisateur est connecté, autoriser l'accès
    if (idUser) {
      return true;
    } else {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      this.router.navigate(['/login']);
      return false;
    }
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
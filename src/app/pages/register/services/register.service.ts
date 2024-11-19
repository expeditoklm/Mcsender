// modal.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../users/models/user';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService { 
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  private registerUrl = `${environment.apiUrl}auth/signup`;


  signUp(userDto: User) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.registerUrl, userDto, { headers });
  }

} 

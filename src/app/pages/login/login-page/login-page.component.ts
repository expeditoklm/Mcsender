import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormControlComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputGroupComponent, NzInputModule } from 'ng-zorro-antd/input';
import { RegisterService } from '../../register/services/register.service';
import { LoginService } from '../services/login.service';
import { ToastService } from '../../../consts/components/toast/toast.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    NzFormControlComponent,
    NzInputGroupComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzFormModule,
    NzIconModule,
    RouterModule,

  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {
  loginForm!: FormGroup;
  userData!: any;
  userDto!: any;

    // Icônes NG-ZORRO
    emailIcon = 'mail';
    passwordIcon = 'lock';
  
    
      // Propriétés pour les messages d'erreur
      emailErrorTip = 'Veuillez entrer une adresse email valide.';
      passwordErrorTip = 'Le mot de passe doit contenir au moins 6 caractères.';
    
  

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.userData = this.loginForm.value;
      this.userDto = {
        email: this.userData.email,
        password: this.userData.password,
      };

      this.loginService.signIn(this.userDto).subscribe({
        next: (response: any) => {
          console.log(response);

          const { token, user } = response;
          sessionStorage.setItem("user_session_token", token);
          sessionStorage.setItem("user_session_username", user.userName + ' ' + user.name );

          // Décoder le token pour obtenir les informations utilisateur
          // const decodedToken = this.loginService.decodeJWT(token);
          // if (decodedToken) {
          //   console.log("Nom d'utilisateur :", decodedToken.id);
          //   console.log("Email de l'utilisateur :", decodedToken.email);
          // }
          const fk = this.loginService.getUserId();
          console.log("id meme:", fk);

          this.toastService.showSuccess('Connexion réussie !');
          this.router.navigateByUrl('/dashboard');
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Coordonnées Invalides';
          this.toastService.showError(errorMessage);
        }
      });
    } else {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
      this.toastService.showError('Veuillez corriger les erreurs.');
    }
  }
}

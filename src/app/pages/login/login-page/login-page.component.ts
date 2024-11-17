import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormControlComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputGroupComponent, NzInputModule } from 'ng-zorro-antd/input';

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

  // Icônes NG-ZORRO
  emailIcon = 'mail';
  passwordIcon = 'lock';

  
    // Propriétés pour les messages d'erreur
    emailErrorTip = 'Veuillez entrer une adresse email valide.';
    passwordErrorTip = 'Le mot de passe doit contenir au moins 6 caractères.';
  

  constructor(private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      alert('Connexion réussie !');
      this.router.navigate(['/dashboard']);
    } else {
      alert('Veuillez corriger les erreurs.');
    }
  }
}
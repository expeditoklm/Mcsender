import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormControlComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputGroupComponent, NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-register-page',
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
    RouterModule
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})

export class RegisterPageComponent implements OnInit {
  registerForm!: FormGroup;

  // Icônes NG-ZORRO
  userIcon = 'user';
  emailIcon = 'mail';
  passwordIcon = 'lock';
  phoneIcon = 'phone';

  // Messages d'erreur
  nameErrorTip = 'Le nom est requis.';
  emailErrorTip = 'Veuillez entrer une adresse email valide.';
  passwordErrorTip = 'Le mot de passe doit contenir au moins 6 caractères.';
  confirmPasswordErrorTip = 'Les mots de passe ne correspondent pas.';
  phoneErrorTip = 'Numéro de téléphone invalide.';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validateur personnalisé pour la correspondance des mots de passe
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
    } else {
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      console.log('Formulaire valide:', this.registerForm.value);
      // Logique d'inscription à implémenter
      alert('Inscription réussie !');
    } else {
      Object.values(this.registerForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
      alert('Veuillez corriger les erreurs.');
    }
  }
}
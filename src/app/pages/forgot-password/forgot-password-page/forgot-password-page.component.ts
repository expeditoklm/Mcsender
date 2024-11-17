// forgot-password.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormControlComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputGroupComponent, NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-forgot-password-page',
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
  templateUrl: './forgot-password-page.component.html',
  styleUrl: './forgot-password-page.component.css'
})
export class ForgotPasswordPageComponent implements OnInit {
  forgotPasswordForm!: FormGroup;

  // Icône NG-ZORRO
  emailIcon = 'mail';

  // Message d'erreur
  emailErrorTip = 'Veuillez entrer une adresse email valide.';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      console.log('Email soumis:', this.forgotPasswordForm.value.email);
      // TODO: Implémenter la logique de réinitialisation du mot de passe
      alert('Un email de réinitialisation a été envoyé si le compte existe.');
    } else {
      Object.values(this.forgotPasswordForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
      alert('Veuillez corriger les erreurs.');
    }
  }
}
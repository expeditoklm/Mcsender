import { Component, Input } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import {  NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { User } from '../../models/user';


@Component({
  selector: 'app-user-create',
  standalone: true,

  templateUrl: './user-create.component.html',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NzButtonModule,
    NzInputModule,
    NzStepsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzStepsModule,
    NzFormModule,  // Ajout de NzFormModule pour utiliser nz-form-explain
    NzGridModule, 
    NzOptionComponent,
    NzSelectComponent
  ]
})
export class UserCreateComponent {
  @Input() userData: any; // Données initiales fournies par le parent

  formData : User = {
    name: '',
    username: '',
    email: '',
    role: '',
    password: '',
  };

  constructor(private modal: NzModalRef) {}

  ngOnInit(): void {
    // Pré-remplir le formulaire si des données sont fournies
    if (this.userData) {
      this.formData = {
        ...this.formData,
        ...this.userData,
      };
    }
  }

  submitForm(): void {
    console.log('Form Data:', this.formData);
    // Envoyer les données au composant parent
    
    this.modal.destroy(this.formData);
  }

  cancel(): void {
    // Annuler et fermer le modal sans retourner de données
    this.modal.destroy();
  }
}

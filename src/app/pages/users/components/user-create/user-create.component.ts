import { Component, Inject, Input, OnInit } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { User } from '../../models/user';
import { Roles } from '../../../../consts/role';


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
    NzButtonModule,
    NzInputModule,
    NzStepsModule,
    NzFormModule,  
    NzGridModule,
    NzOptionComponent,
    NzSelectComponent
  ]
})
export class UserCreateComponent implements OnInit {
  @Input() userData?: User; 
  roles = Object.keys(Roles);

  getRoleLabel(role: string): string {
    switch (role) {
      case Roles.SUPER_ADMIN:
        return 'Super-Admin';
      case Roles.ADMIN:
        return 'Administrateur';
      case Roles.USER:
        return 'Utilisateur';
      default:
        return role;
    }
  }
  

  formData: User = {
    id: undefined,
    name: '',
    username: '',
    email: '',
    role: '',
  };

  constructor(private modal: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: any
  ) { }

  ngOnInit(): void {
    // Pré-remplir le formulaire si des données sont fournies
    if (this.data.userData) {
      this.formData = {
        ...this.formData,
        ...this.data.userData,
      };
    }
  }

  submitForm(): void {
    this.modal.destroy(this.formData);
  }

  cancel(): void {
    this.modal.destroy();
  }
}
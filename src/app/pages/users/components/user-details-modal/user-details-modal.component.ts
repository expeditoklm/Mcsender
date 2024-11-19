import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// Ng Zorro Modules
import { NzModalModule, NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserCompanyService } from '../../services/userCompany.service';
import { User } from '../../models/user';
import { NzTabComponent, NzTabSetComponent } from 'ng-zorro-antd/tabs';

// Services

// Interfaces

@Component({
  selector: 'app-user-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    NzModalModule,
    NzButtonModule,
    NzCardModule,
    NzTagModule,
    NzSpinModule,
    NzIconModule,
    NzTabSetComponent,
    NzTabComponent,
  ],
  templateUrl: './user-details-modal.component.html',
  styleUrls: ['./user-details-modal.component.css']
})

export class UserDetailsModalComponent implements OnInit, OnDestroy {
  user: User;
  userCompanies: any = [];
  isLoadingCompanies = false;
  
  private companiesSubscription?: Subscription;

  constructor(
    private modalRef: NzModalRef,
    private userCompanyService: UserCompanyService,
    @Inject(NZ_MODAL_DATA) public data: { user: User }
  ) {
    this.user = data.user;
  }

  ngOnInit(): void {
    this.loadUserCompanies();
  }

  ngOnDestroy(): void {
    this.companiesSubscription?.unsubscribe();
  }

  loadUserCompanies(): void {
    if (this.user?.id) {
    this.isLoadingCompanies = true;
    this.companiesSubscription = this.userCompanyService.getAllCompanyForUser(this.user.id)
      .subscribe({
        next: (companies) => {
          this.userCompanies = companies;
          this.isLoadingCompanies = false;
        },
        error: () => {
          this.isLoadingCompanies = false;
        }
      });
  }
}

  /**
   * Détermine la couleur du tag en fonction du rôle
   * @param role Rôle de l'utilisateur
   * @returns Couleur correspondante
   */
  getRoleColor(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'user':
        return 'blue';
      case 'super-admin':
        return 'green';
      default:
        return 'default';
    }
  }

  closeModal(): void {
    this.modalRef.destroy();
  }
}
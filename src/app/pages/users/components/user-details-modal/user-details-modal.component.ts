import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule, NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { QueryClient, QueryObserver } from '@ngneat/query';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { UserCompanyService } from '../../services/userCompany.service';
import { User } from '../../models/user';
import { Company } from '../../../companies/models/company';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabComponent, NzTabSetComponent } from 'ng-zorro-antd/tabs';



@Component({
  selector: 'app-user-details-modal',
  standalone: true,
  imports: [CommonModule,
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
  styleUrls: ['./user-details-modal.component.css'],
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class UserDetailsModalComponent implements OnInit {
  user: any;
  companies: any = [];
  isLoading = true;
  isError = false;

  constructor(
    private modalRef: NzModalRef,
    private userCompanyService: UserCompanyService,
    @Inject(NZ_MODAL_DATA) public data: { user: User },
    private cdr: ChangeDetectorRef, 
    private queryClient: QueryClient
  ) {
    this.user = data.user;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loadUserCompanies();
    }, 500); 
  }

  loadUserCompanies(): void {
    this.isLoading = true; 
    const queryObserver = new QueryObserver<Company[]>(this.queryClient, {
      queryKey: ['userCompanies', this.user.id],
      queryFn: async () => {
        return await firstValueFrom(this.userCompanyService.getAllCompanyForUser(this.user.id));
      }
    });

    queryObserver.subscribe((result) => {
      if (result.error) {
        this.isError = true;
        console.error('Error fetching user companies:', result.error);
      } else {
        this.companies = result.data || [];
        this.isError = false;
        this.isLoading = result.isFetching;
      }
    });
  }

  getRoleColor(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'manager':
        return 'blue';
      default:
        return 'green';
    }
  }

  closeModal(): void {
    this.modalRef.destroy();
  }
}
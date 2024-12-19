import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { Roles } from '../../../../consts/role';
import { CampaignDto, CampaignStatus } from '../../models/campaign';
import { Router } from '@angular/router';
import { ToastService } from '../../../../consts/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { CompanyService } from '../../../companies/services/company.service';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { UserService } from '../../../users/services/user.service';
import { UserCompanyService } from '../../../users/services/userCompany.service';
import { Company } from '../../../companies/models/company';
import { firstValueFrom } from 'rxjs';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-campaign-create',
  standalone: true,
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
    NzSelectComponent,
    NzDatePickerModule,
  ],
  templateUrl: './campaign-create.component.html',
  styleUrl: './campaign-create.component.css',
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class CampaignCreateComponent implements OnInit {
  @Input() campaignData?: CampaignDto;
  campaignStatus = CampaignStatus;
  campaignStatuses = Object.values(CampaignStatus);
  roles = Object.keys(Roles);
  isLoading = false;
  isError = false;
  companies: Company[] = [];

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

  formData: CampaignDto = {
    id: undefined,
    name: '',
    start_date: undefined, // Align with the `Date | undefined` type
    end_date: undefined, // Align with the `Date | undefined` type
    status: CampaignStatus.PENDING, // Provide a default valid enum value
    company_id: 0, // Assuming 0 or another placeholder for `number`
  };

  constructor(
    private modal: NzModalRef,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private toastService: ToastService,
    private http: HttpClient,
    private companyService: CompanyService,
    private queryClient: QueryClient,
    private userService: UserService,
    private userCompanyService: UserCompanyService,
    @Inject(NZ_MODAL_DATA) public data: any
  ) {}
  ngOnInit(): void {
    // Pré-remplir le formulaire si des données sont fournies
    if (this.data.campaignData) {
      this.formData = {
        ...this.formData,
        ...this.data.campaignData,
      };
    }

    // Charger les entreprises
    this.loadCompanies();
  }

  loadCompanies() {
    this.isLoading = true;
    const queryObserver = new QueryObserver<any>(this.queryClient, {
      queryKey: ['companiesList'],
      queryFn: async () => {
        return await firstValueFrom(this.companyService.getAllCompanies());
      },
    });

    queryObserver.subscribe((result) => {
      if (
        result.status === 'success' &&
        Array.isArray(result.data?.companies)
      ) {
        this.companies = result.data.companies; // Assignation correcte
        this.isError = false;
      } else if (result.status === 'error') {
        this.isError = true;
        console.error(
          'Erreur lors du chargement des entreprises:',
          result.error
        );
      }
      this.isLoading = false;
    });
  }

  submitForm(): void {
    if (this.formData.company_id && this.formData.name) {
      const payload = {
        ...this.formData,
        start_date: this.formData.start_date
          ? new Date(this.formData.start_date).toISOString() // Conversion explicite
          : undefined,
        end_date: this.formData.end_date
          ? new Date(this.formData.end_date).toISOString() // Conversion explicite
          : undefined,
      };
  
      console.log('Payload envoyé au backend :', payload);
      this.modal.destroy(payload);
    } else {
      this.toastService.showError('Veuillez remplir tous les champs obligatoires.');
    }
  }
  

  cancel(): void {
    this.modal.destroy();
  }
}

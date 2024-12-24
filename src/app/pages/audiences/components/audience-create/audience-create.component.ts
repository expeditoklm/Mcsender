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
import { Router } from '@angular/router';
import { ToastService } from '../../../../consts/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { CompanyService } from '../../../companies/services/company.service';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { UserService } from '../../../users/services/user.service';
import { UserCompanyService } from '../../../users/services/userCompany.service';
import { firstValueFrom } from 'rxjs';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { Audience } from '../../models/Audience';
import { CreateCompanyDto } from '../../../companies/models/createCompanyDto';
import { Company } from '../../../companies/models/company';

@Component({
  selector: 'app-audience-create',
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
  templateUrl: './audience-create.component.html',
  styleUrl: './audience-create.component.css',
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class AudienceCreateComponent implements OnInit {
  @Input() audienceData?: Audience;

  roles = Object.keys(Roles);
  isLoading = false;
  isError = false;
  audiences: Audience[] = [];
  companies: Company[] = [];

  formData: Audience = {
    id: undefined,
    name: '',
    description: '', 
    companyId: 0, 
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
  ) {
console.log("données du formulaire",this.data.audienceData)
  }
  ngOnInit(): void {
    // Pré-remplir le formulaire si des données sont fournies
    if (this.data.audienceData) {
      this.formData = {
        ...this.formData,
        ...this.data.audienceData,
        companyId: this.data.audienceData.company_id, // Conversion explicite si nécessaire
      };
    }
    console.log("données du formdata",this.formData)

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
        // Filtrer uniquement les entreprises actives
        this.companies = result.data.companies.filter((company: Company) => company.isActive); 
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
    //console.log('Payload envoyé au backend :', payload);
    this.modal.destroy(this.formData);
  }

  cancel(): void {
    this.modal.destroy();
  }
}

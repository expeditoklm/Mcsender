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
import { Company } from '../../../companies/models/company';
import { firstValueFrom } from 'rxjs';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { CreateCompanyDto } from '../../../companies/models/createCompanyDto';
import { CreateContactDto } from '../../models/CreateContactDto';

@Component({
  selector: 'app-contact-update',
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
  templateUrl: './contact-update.component.html',
  styleUrl: './contact-update.component.css',
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class ContactUpdateComponent implements OnInit {
  @Input() contactData?: CreateContactDto;

  isLoading = false;
  isError = false;



  formData: CreateContactDto = {
    id: undefined,
    name: '',
    username: '',
    email: '',
    phone: '',
    source: '',
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
    if (this.data.contactData) {
      this.formData = {
        ...this.formData,
        ...this.data.contactData,
      };
    }

    // Charger les entreprises
  }


  submitForm(): void {
      this.modal.destroy(this.formData);
   
  }
  

  cancel(): void {
    this.modal.destroy();
  }
}

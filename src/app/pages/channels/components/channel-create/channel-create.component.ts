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
import { Router } from '@angular/router';
import { ToastService } from '../../../../consts/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { CompanyService } from '../../../companies/services/company.service';
import { QueryClient } from '@tanstack/query-core';
import { UserService } from '../../../users/services/user.service';
import { UserCompanyService } from '../../../users/services/userCompany.service';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { Channel } from '../../models/Channel';

@Component({
  selector: 'app-channel-update',
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
    NzDatePickerModule,
  ],
  templateUrl: './channel-create.component.html',
  styleUrl: './channel-create.component.css',
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class ChannelCreateComponent implements OnInit {
  @Input() channelData?: Channel;

  isLoading = false;
  isError = false;

  formData: Channel = {
    id: undefined,
    label: '',
    
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
    if (this.data.channelData) {
      this.formData = {
        ...this.formData,
        ...this.data.channelData,
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

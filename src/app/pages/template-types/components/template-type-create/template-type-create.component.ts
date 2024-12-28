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
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { UserService } from '../../../users/services/user.service';
import { UserCompanyService } from '../../../users/services/userCompany.service';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { CreateTemplateType } from '../../models/CreateTemplateType';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { firstValueFrom } from 'rxjs';
import { ChannelService } from '../../../channels/services/channel.service';

@Component({
  selector: 'app-template-type-create',
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
    NzOptionComponent,
    NzSelectComponent,
  ],
  templateUrl: './template-type-create.component.html',
  styleUrl: './template-type-create.component.css',
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class templateTypeCreateComponent implements OnInit {
  @Input() templateTypeData?: CreateTemplateType;

  isLoading = false;
  isError = false;
  channels: any;

  formData: CreateTemplateType = {
    id: undefined,
    label: '',
    channel_id: 0,
  };

  constructor(
    private modal: NzModalRef,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private toastService: ToastService,
    private channelService: ChannelService,
    private queryClient: QueryClient,
    private userService: UserService,
    private userCompanyService: UserCompanyService,
    @Inject(NZ_MODAL_DATA) public data: any
  ) {}
  ngOnInit(): void {
    // Pré-remplir le formulaire si des données sont fournies
    if (this.data.templateTypeData) {
      this.formData = {
        ...this.formData,
        ...this.data.templateTypeData,
      };
    }
    // Charger les canaux
    this.loadCompanies()
  }

  loadCompanies() {
    this.isLoading = true;
    const queryObserver = new QueryObserver<any>(this.queryClient, {
      queryKey: ['channelsList'],
      queryFn: async () => {
        return await firstValueFrom(this.channelService.getAllChannels());
      },
    });

    queryObserver.subscribe((result) => {
      if (
        result.status === 'success' &&
        Array.isArray(result.data)
      ) {
        // Assurez-vous que les données sont dans le bon format
        this.channels = result.data.map((channel: any) => ({
          id: channel.id,
          label: channel.label,
        }));
        this.isError = false;
      } else if (result.status === 'error') {
        this.isError = true;
        console.error(
          'Erreur lors du chargement des canaux:',
          result.error
        );
      }
      this.isLoading = false;
    });
    
  }

  submitForm(): void {
      this.modal.destroy(this.formData);
   
  }
  

  cancel(): void {
    this.modal.destroy();
  }
}

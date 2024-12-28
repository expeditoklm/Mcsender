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
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { firstValueFrom } from 'rxjs';
import { ChannelService } from '../../../channels/services/channel.service';
import { Message, MessageStatus } from '../../models/Message';

@Component({
  selector: 'app-message-create',
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
  templateUrl: './message-create.component.html',
  styleUrl: './message-create.component.css',
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class MessageCreateComponent implements OnInit {
  @Input() messageData?: Message;

  isLoading = false;
  isError = false;
  companies: any;
  messageStatus: MessageStatus = MessageStatus.PENDING; // Valeur par défaut

   MsgStatus = Object.keys(MessageStatus);
  
    getStatusLabel(MsgStatus: string): string {
      switch (MsgStatus) {
        case MessageStatus.PENDING:
          return 'En cours';
        case MessageStatus.SENT:
          return 'Envoyer';
        case MessageStatus.FAILED:
          return 'Echouer';
        case MessageStatus.SCHEDULED:
          return 'Programmer';
        default:
          return MsgStatus;
      }
    }

 

  formData: Message = {
    id: undefined,
    object: '',
    content: '',
    company_id: 0,
    status: this.messageStatus,
    campaign_id: 0,
    audience_id: 0,
    scheduledDate: undefined,
  };

  constructor(
    private modal: NzModalRef,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private toastService: ToastService,
    private companyService: CompanyService,
    private queryClient: QueryClient,
    private userService: UserService,
    private userCompanyService: UserCompanyService,
    @Inject(NZ_MODAL_DATA) public data: any
  ) {}
  ngOnInit(): void {
    // Pré-remplir le formulaire si des données sont fournies
    if (this.data.messageData) {
      this.formData = {
        ...this.formData,
        ...this.data.messageData,
      };
    }
    // Charger les canaux
    this.loadCompanies()
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
      this.modal.destroy(this.formData);
   
  }
  

  cancel(): void {
    this.modal.destroy();
  }
}

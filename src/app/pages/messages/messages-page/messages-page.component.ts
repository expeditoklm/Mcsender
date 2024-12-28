import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule } from '@angular/forms';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { debounceTime, firstValueFrom, Subject } from 'rxjs';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Router, RouterModule } from '@angular/router';
import { UserDetailsModalComponent } from '../../users/components/user-details-modal/user-details-modal.component';
import { ToastService } from '../../../consts/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { Message, MessageStatus } from '../models/Message';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { MessageCreateComponent } from '../components/message-create/message-create.component';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { MessageService } from '../services/message.service';
import { CompanyService } from '../../companies/services/company.service';
import { Company } from '../../companies/models/company';
import { CampaignService } from '../../campaigns/services/campaign.service';
import { DeleteModalService } from '../../../consts/components/delete-modal/delete-modal.service';

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzTableModule,
    NzModalModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    FormsModule,
    NzPaginationModule,
     NzSelectComponent,
     NzOptionComponent,
  ],
  templateUrl: './messages-page.component.html',
  styleUrl: './messages-page.component.css',
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})

export class MessagesPageComponent implements OnInit {

  constructor(
    private modalService: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private deleteModalService: DeleteModalService,
    private toastService: ToastService,
    private messageService: MessageService,
    private companyService: CompanyService,
    private campaignService: CampaignService,
    private queryClient: QueryClient,
    private http: HttpClient
  ) {}
  MessageStatus = MessageStatus;
  tabStatus = Object.values(MessageStatus);
  companies: Company[] = [];
  

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

    messages: Message[] = [];
    filteredMessage: Message[] = [];
    
    isLoading = false;
    isError = false;

    pageIndex = 1;
    pageSize = 5;
    total = this.messages.length;
    isModalVisible = false;
    private searchSubject: Subject<void> = new Subject();
  
  searchObjet = '';
  searchContent = '';
  searchCompany = '';
  searchStatus = '';


  ngOnInit(): void {
    setTimeout(() => {
      this.loadMessages();
    }, 500); // Délai en millisecondes

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      this.filterMessages();
    });
    this.loadCompanies()
  }

  // Fonction de recherche
  onSearchChange(): void {
    this.searchSubject.next();
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
  

  loadMessages() {
    this.isLoading = true;
    const queryObserver = new QueryObserver<any>(this.queryClient, {
      queryKey: ['messagesList'],
      queryFn: async () => {
        return await firstValueFrom(this.messageService.getAllMessages());
      },
    });

    queryObserver.subscribe((result) => {
      if (result.error) {
        this.isError = true;
        console.error('Erreur lors du chargement des messages:', result.error);
        this.toastService.showError('Erreur lors du chargement des messages.');
      } else {
        this.messages = result.data || [];
        this.filterMessages();
        this.isError = false;
        this.isLoading = result.isFetching;
      }
    });
  }

  filterMessages(): void {
    let filtered = [...this.messages];
    console.log("filtered",filtered)

    // Fonction asynchrone pour récupérer le nom de la compagnie
    const fetchCompanyName = async (campaignId: number): Promise<string> => {
      console.log("campaignId",campaignId)

      try {
        const campaign = await firstValueFrom(
          this.campaignService.findOne(campaignId)
        );
        console.log("campaign",campaign)

        const company = await firstValueFrom(
          this.companyService.getCompanyById(campaign.company_id)
        );
        console.log("company",company)
        return company?.name || '';
      } catch (error) {
        
        console.error(
          `Erreur lors de la récupération de la compagnie avec ID ${campaignId}`,
          error
        );
        return '';
      }
    };

    // Appliquer les filtres
    const filterAsync = async () => {
      const promises = filtered.map(async (message) => {
        const companyLib = await fetchCompanyName(message.company_id);

        const object = message.object?.toLowerCase() || '';
        const content = message.content?.toString().toLowerCase() || '';
        const status = message.status?.toString().toLowerCase() || '';

        const matchesFilters =
        object.includes(this.searchObjet.toLowerCase()) &&
        content.includes(this.searchContent.toLowerCase()) &&
        status.includes(this.searchStatus.toLowerCase()) &&
          companyLib.toLowerCase().includes(this.searchCompany.toLowerCase()) &&
          status.includes(this.searchStatus.toLowerCase());

        if (matchesFilters) {
          return { ...message, companyLib }; // Ajoutez le nom de la compagnie
        }

        return null;
      });

      const filteredResults = await Promise.all(promises);
      const finalFiltered = filteredResults.filter((result) => result !== null);

      this.total = finalFiltered.length;

      const start = (this.pageIndex - 1) * this.pageSize;
      this.filteredMessage = finalFiltered.slice(
        start,
        start + this.pageSize
      );
      this.cdr.detectChanges(); // Nécessaire pour forcer Angular à re-rendre la vue
    };

    filterAsync().catch((error) =>
      console.error('Erreur lors du filtrage des campagnes :', error)
    );
  }
  
   // Pagination
    onPageIndexChange(pageIndex: number): void {
      this.pageIndex = pageIndex;
      this.filterMessages();
    }
  
    onPageSizeChange(pageSize: number): void {
      this.pageSize = pageSize;
      this.pageIndex = 1;
      this.filterMessages();
    }
  
    openMessageCreateModal(messageData?: Message): void {
      const modalRef = this.modalService.create({
        nzTitle: messageData ? 'Modifier le message' : 'Créer un message',
        nzContent: MessageCreateComponent,
        nzFooter: null,
        nzWidth: '600px',
        nzData: {
          messageData: messageData,
          isEdit: !!messageData,
        },
      });
  
      modalRef.afterClose.subscribe((messageDto) => {
        if (messageDto) {
          const { id, created_at, updated_at, deleted,channelLib,templates, ...filteredmessageDto } = messageDto;
          const operation = id
            ? this.messageService.updateMessage(id, filteredmessageDto)
            : this.messageService.createMessage(filteredmessageDto);
  
          operation.subscribe({
            next: (message) => {
              if (messageDto.id) {
                const index = this.messages.findIndex((u) => u.id === message.id);
                if (index !== -1) {
                  this.messages[index] = message;
                }
                this.loadMessages();
                this.toastService.showSuccess('message mis à jour avec succès.');
              } else {
                this.loadMessages();
                this.toastService.showSuccess('message créé avec succès.');
              }
              this.filterMessages();
            },
            error: (e: any) => {
              console.error("Erreur lors de l'opération message:", e.error.message);
              this.toastService.showError(e.error.message);
            },
          });
        }
      });
    }
  
    openDeleteModal(message: any): void {
      if (!message.id) {
        this.toastService.showError('ID du message non valide');
        return;
      }
  
      const modalData = {
        title: 'Supprimer ce message?',
        message: 'Êtes-vous sûr de vouloir supprimer ce message? Cette action est irréversible.',
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        callback: () => this.handleDelete(message.id), // Le '!' indique que nous sommes sûrs que l'id existe
      };
  
      this.deleteModalService.openModal(modalData);
    }
  
    handleDelete(messageId: number): void {
      this.messageService.deleteMessage(messageId).subscribe({
        next: () => {
          this.messages = this.messages.filter((templateType) => templateType.id !== messageId);
          this.filterMessages();
          this.toastService.showSuccess('Le messagea été supprimé avec succès.');
        },
        error: (error) => {
          console.error("Erreur lors de la suppression du message:", error);
          this.toastService.showError("Erreur lors de la suppression du type de modèle");
        },
      });
    }

  // Afficher les détails d'un utilisateur
  viewDetailsUser(user: any): void {
    this.modalService.create({
      nzTitle: 'Détails de l\'utilisateur',
      nzContent: UserDetailsModalComponent,
      nzData: { user },
      nzFooter: null
    });
  }

}

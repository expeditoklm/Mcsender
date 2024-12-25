import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { debounceTime, Subject, finalize, firstValueFrom } from 'rxjs';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Router, RouterModule } from '@angular/router';
import { DeleteModalService } from '../../../consts/components/delete-modal/delete-modal.service';
import { ToastService } from '../../../consts/components/toast/toast.service';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { CampaignDto, CampaignStatus } from '../models/campaign';
import { CampaignService } from '../services/campaign.service';
import { CompanyService } from '../../companies/services/company.service';
import { CampaignCreateComponent } from '../components/campaign-create/campaign-create.component';
import { UserDetailsModalComponent } from '../../users/components/user-details-modal/user-details-modal.component';

@Component({
  selector: 'app-campaigns-page',
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
    NzSpinModule,
    ReactiveFormsModule,
    NzStepsModule,
    NzStepsModule,
    NzFormModule,
    NzGridModule,
  ],

  templateUrl: './campaigns-page.component.html',
  styleUrl: './campaigns-page.component.css',
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class CampaignsPageComponent implements OnInit {
  campaigns: CampaignDto[] = [];
  filteredCampaigns: CampaignDto[] = [];
  isLoading = false;
  campaignStatus = CampaignStatus;
  campaignStatuses = Object.values(CampaignStatus);
  isError = false;
  searchName = '';
  searchStartDate = '';
  searchEndDate = '';
  searchCompany = '';
  searchStatus = '';
  pageIndex = 1;
  pageSize = 5;
  total = 0;
  isModalVisible = false;
  private searchSubject: Subject<void> = new Subject();

  constructor(
    private modalService: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private deleteModalService: DeleteModalService,
    private toastService: ToastService,
    private campaignService: CampaignService,
    private companyService: CompanyService,

    private queryClient: QueryClient
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.loadCampaigns();
    }, 500); // Délai en millisecondesbv

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      this.filterCampaigns();
    });
  }

  loadCampaigns() {
    this.isLoading = true;
    const queryObserver = new QueryObserver<any>(this.queryClient, {
      queryKey: ['campaignsList'],
      queryFn: async () => {
        return await firstValueFrom(this.campaignService.getAllCampaigns());
      },
    });

    queryObserver.subscribe((result) => {
      if (result.error) {
        this.isError = true;
        console.error('Erreur lors du chargement des campagnes:', result.error);
        this.toastService.showError('Erreur lors du chargement des campagnes.');
      } else {
        this.campaigns = result.data || [];
        this.filterCampaigns();
        this.isError = false;
        this.isLoading = result.isFetching;
      }
    });
  }

  filterCampaigns(): void {
    let filtered = [...this.campaigns];

    // Fonction asynchrone pour récupérer le nom de la compagnie
    const fetchCompanyName = async (companyId: number): Promise<string> => {
      try {
        const company = await firstValueFrom(
          this.companyService.getCompanyById(companyId)
        );
        return company?.name || '';
      } catch (error) {
        
        console.error(
          `Erreur lors de la récupération de la compagnie avec ID ${companyId}`,
          error
        );
        return '';
      }
    };

    // Appliquer les filtres
    const filterAsync = async () => {
      const promises = filtered.map(async (campaign) => {
        const companyLib = await fetchCompanyName(campaign.company_id);

        const name = campaign.name?.toLowerCase() || '';
        const startDate = campaign.start_date?.toString().toLowerCase() || '';
        const endDate = campaign.end_date?.toString().toLowerCase() || '';
        const status = campaign.status?.toLowerCase() || '';

        const matchesFilters =
          name.includes(this.searchName.toLowerCase()) &&
          startDate.includes(this.searchStartDate.toLowerCase()) &&
          endDate.includes(this.searchEndDate.toLowerCase()) &&
          companyLib.toLowerCase().includes(this.searchCompany.toLowerCase()) &&
          status.includes(this.searchStatus.toLowerCase());

        if (matchesFilters) {
          return { ...campaign, companyLib }; // Ajoutez le nom de la compagnie
        }

        return null;
      });

      const filteredResults = await Promise.all(promises);
      const finalFiltered = filteredResults.filter((result) => result !== null);

      this.total = finalFiltered.length;

      const start = (this.pageIndex - 1) * this.pageSize;
      this.filteredCampaigns = finalFiltered.slice(
        start,
        start + this.pageSize
      );
      this.cdr.detectChanges(); // Nécessaire pour forcer Angular à re-rendre la vue
    };

    filterAsync().catch((error) =>
      console.error('Erreur lors du filtrage des campagnes :', error)
    );
  }

  onSearchChange(): void {
    this.searchSubject.next();
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.filterCampaigns();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.filterCampaigns();
  }

  openCampaignCreateModal(campaignData?: any): void {
    const modalRef = this.modalService.create({
      nzTitle: campaignData ? "Modifier la campagne" : 'Créer une campagne',
      nzContent: CampaignCreateComponent,
      nzFooter: null,
      nzWidth: '600px',
      nzData: {
        campaignData: campaignData,
        isEdit: !!campaignData,
      },
    });

    modalRef.afterClose.subscribe((campaignDto) => {
      if (campaignDto) {
        if (!campaignDto.company_id) {
          this.toastService.showError('L\'identifiant de la compagnie est requis.');
          return;
        }
    
        const { id, created_at, updated_at, deleted,companyLib, ...filteredCampaignDto } = campaignDto;
    
        const operation = id
          ? this.campaignService.updateCampaign(id, filteredCampaignDto)
          : this.campaignService.createCampaign(filteredCampaignDto);
  
        operation.subscribe({
          next: (campaign) => {
            if (campaignDto.id) {
              const index = this.campaigns.findIndex((u) => u.id === campaign.id);
              if (index !== -1) {
                this.campaigns[index] = campaign;
              }
              this.loadCampaigns();
              this.toastService.showSuccess('Campagne mise à jour avec succès.');
            } else {
              this.loadCampaigns();
              this.toastService.showSuccess('Campagne créée avec succès.');
            }
            this.filterCampaigns();
          },
          error: (e: any) => {
            console.error('Erreur lors de l\'opération campagne :', e.error.message);
            this.toastService.showError(e.error.message);
          },
        });
      }
    });
    
  }


  openDeleteModal(campaign: any) {
    if (!campaign.id) {
      this.toastService.showError('ID de la campagne non valide');
      return;
    }

    const modalData = {
      title: 'Supprimer cette camapagne ?',
      message:
        'Êtes-vous sûr de vouloir supprimer cette campagne ? Cette action est irréversible.',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      callback: () => this.handleDelete(campaign.id!), // Le '!' indique que nous sommes sûrs que l'id existe
    };

    this.deleteModalService.openModal(modalData);
  }

  handleDelete(campaignId: number): void {
    this.campaignService.cancelCampaign(campaignId).subscribe({
      next: () => {
        this.campaigns = this.campaigns.filter((campaign) => campaign.id !== campaignId);
        this.filterCampaigns();
        this.toastService.showSuccess(
          `La campagne a été supprimé avec succès.`
        );
      },
      error: (error) => {
        console.error("Erreur lors de la suppression de la campagne:", error);
        this.toastService.showError(
          "Erreur lors de la suppression de la campagne."
        );
      },
    });
  }

 

  ngOnDestroy() {
    // Nettoyage du Subject pour éviter les fuites de mémoire
    this.searchSubject.complete();
  }
}

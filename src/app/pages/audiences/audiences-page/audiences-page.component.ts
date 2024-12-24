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
import { DeleteModalService } from '../../../consts/components/delete-modal/delete-modal.service';
import { ToastService } from '../../../consts/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { Audience } from '../models/Audience';
import { CompanyService } from '../../companies/services/company.service';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { AudienceService } from '../services/audiance.service';
import { AudienceCreateComponent } from '../components/audience-create/audience-create.component';

@Component({
  selector: 'app-audiences-page',
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
  ],
  templateUrl: './audiences-page.component.html',
  styleUrl: './audiences-page.component.css',
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class AudiencesPageComponent implements OnInit {
  audiences: Audience[] = [];
  filteredAudiences: Audience[] = [];
  isLoading = false;
  isError = false;

  constructor(
    private modalService: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private deleteModalService: DeleteModalService,
    private toastService: ToastService,
    private http: HttpClient,
    private companyService: CompanyService,
    private audienceService: AudienceService,
    private queryClient: QueryClient
  ) {}

  searchName = '';
  searchDescription = '';
  searchCompany = '';

  pageIndex = 1;
  pageSize = 5;
  total = this.audiences.length;
  isModalVisible = false;
  private searchSubject: Subject<void> = new Subject();

  ngOnInit() {
    setTimeout(() => {
      this.loadAudiences();
    }, 500); // Délai en millisecondesbv

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      this.filterAudiences();
    });
  }

  loadAudiences() {
    this.isLoading = true;
    const queryObserver = new QueryObserver<any>(this.queryClient, {
      queryKey: ['audiencesList'],
      queryFn: async () => {
        return await firstValueFrom(this.audienceService.getAllAudiences());
      },
    });

    queryObserver.subscribe((result) => {
      if (result.error) {
        this.isError = true;
        console.error('Erreur lors du chargement des audiences:', result.error);
        this.toastService.showError('Erreur lors du chargement des audiences.');
      } else {
        if (
          result.data &&
          result.data.audiences &&
          Array.isArray(result.data.audiences)
        ) {
          // Si result.data.audiences est défini et est un tableau
          this.audiences = result.data.audiences;
          this.filterAudiences(); // Appliquez un filtrage ou une logique additionnelle si nécessaire
        } else {
          // Si result.data.audiences est indéfini ou dans un format inattendu
          console.warn('Format inattendu des données :', result.data);
          this.audiences = []; // Initialisez un tableau vide pour éviter des erreurs plus loin
        }

        this.isError = false;
        this.isLoading = false; // Assurez-vous de stopper le chargement
      }
    });
  }

  filterAudiences(): void {
    let filtered = [...this.audiences];
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
      const promises = filtered.map(async (audience: any) => {
        const companyLib = await fetchCompanyName(audience.company_id);

        const name = audience.name?.toLowerCase() || '';
        const description = audience.description?.toLowerCase() || '';

        const matchesFilters =
          name.includes(this.searchName.toLowerCase()) &&
          description.includes(this.searchDescription.toLowerCase()) &&
          companyLib.toLowerCase().includes(this.searchCompany.toLowerCase());

        if (matchesFilters) {
          return { ...audience, companyLib }; // Ajoutez le nom de la compagnie
        }

        return null;
      });

      const filteredResults = await Promise.all(promises);
      const finalFiltered = filteredResults.filter((result) => result !== null);

      this.total = finalFiltered.length;

      const start = (this.pageIndex - 1) * this.pageSize;
      this.filteredAudiences = finalFiltered.slice(
        start,
        start + this.pageSize
      );
      this.cdr.detectChanges(); // Nécessaire pour forcer Angular à re-rendre la vue
    };

    filterAsync().catch((error) =>
      console.error('Erreur lors du filtrage des campagnes :', error)
    );
  }

  // Fonction de recherche
  onSearchChange(): void {
    this.searchSubject.next();
  }

  // Pagination
  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.filterAudiences();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.filterAudiences();
  }

  openAudienceCreateModal(audienceData?: any): void {
    const modalRef = this.modalService.create({
      nzTitle: audienceData ? 'Modifier l\'audience' : 'Créer une audience',
      nzContent: AudienceCreateComponent,
      nzFooter: null,
      nzWidth: '600px',
      nzData: {
        audienceData: audienceData,
        isEdit: !!audienceData,
      },
    });
    modalRef.afterClose.subscribe((audienceDto) => {
      if (audienceDto) {
        if (!audienceDto.companyId) {
          this.toastService.showError(
            "L'identifiant de L'audience est requis."
          );
          return;
        }

        const {
          id,
          created_at,
          updated_at,
          deleted,
          companyLib,
          company_id,
          ...filteredAudienceDto
        } = audienceDto;
     
        const operation = id
          ? this.audienceService.updateAudience(id, filteredAudienceDto)
          : this.audienceService.createAudience(filteredAudienceDto);



        operation.subscribe({
          next: (audience) => {

            if (audienceDto.id) {
              
              const index = this.audiences.findIndex(
                (u) => u.id === audience.id
              );
              if (index !== -1) {
                this.audiences[index] = audience;
              }
              this.loadAudiences();
              this.toastService.showSuccess(
                'Audience mise à jour avec succès.'
              );
            } else {
              this.loadAudiences();
              this.toastService.showSuccess('Audience créée avec succès.');
            }
            this.loadAudiences();
          },
          error: (e: any) => {
            console.error(
              "Erreur lors de l'opération campagne :",
              e.error.message
            );
            this.toastService.showError(e.error.message);
          },
        });
      }
    });
  }


  openDeleteModal(audience: any) {
    if (!audience.id) {
      this.toastService.showError('ID de la campagne non valide');
      return;
    }

    const modalData = {
      title: 'Supprimer cette camapagne ?',
      message:
        'Êtes-vous sûr de vouloir supprimer cette campagne ? Cette action est irréversible.',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      callback: () => this.handleDelete(audience.id!), // Le '!' indique que nous sommes sûrs que l'id existe
    };

    this.deleteModalService.openModal(modalData);
  }

  handleDelete(audienceId: number): void {
    this.audienceService.deleteAudience(audienceId).subscribe({
      next: () => {
        this.audiences = this.audiences.filter((audience) => audience.id !== audienceId);
        this.filterAudiences();
        this.toastService.showSuccess(
          `L\'audience a été supprimé avec succès.`
        );
      },
      error: (error) => {
        console.error("Erreur lors de la suppression de l\'audience :", error);
        this.toastService.showError(
          "Erreur lors de la suppression de l\'audience "
        );
      },
    });
  }

  goToContacts(audience: any): void {
    // Récupérer le label (nom) de l'entreprise à partir de company_id
    this.companyService.getCompanyById(audience.company_id).subscribe(company => {
      // Construire les paramètres de la requête
      const queryParams = {
        audience: audience.name,
        entreprise: company.name, // Le nom de l'entreprise, récupéré
      };
  
      // Naviguer vers la page des contacts en ajoutant les paramètres à l'URL
      this.router.navigate(['/dashboard/contacts'], { queryParams });
    }, (error) => {
      console.error('Erreur lors de la récupération de l\'entreprise:', error);
      // Vous pouvez gérer l'erreur comme vous le souhaitez ici (par exemple afficher un message d'erreur)
    });
  }
  
}

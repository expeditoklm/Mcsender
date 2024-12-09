import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Company } from '../models/company';
import { debounceTime, firstValueFrom, Subject } from 'rxjs';
import { CompanyCreateComponent } from '../components/company-create/company-create.component';
import { CompanyDetailsModalComponent } from '../components/company-details-modal/company-details-modal.component';
import { Router } from '@angular/router';
import { DeleteModalService } from '../../../consts/components/delete-modal/delete-modal.service';
import { ToastService } from '../../../consts/components/toast/toast.service';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { CompanyService } from '../services/company.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-companies-page',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzModalModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    FormsModule,
    NzPaginationModule,
    NzSpinModule,
  ],
  templateUrl: './companies-page.component.html',
  styleUrl: './companies-page.component.css',
})

export class CompaniesPageComponent implements OnInit {
 
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  isLoading = false;
  isError = false;
  searchName = '';
  searchDesc = '';
  searchLocation = '';
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
    private http: HttpClient,
    private companyService: CompanyService,
    private queryClient: QueryClient
  ) {}

  toggleDetails(company: Company): void {
    this.loadCompanies();
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      this.applyFilterAndPaginate();
    });
    company.deleted = !company.deleted;
  }

  

  ngOnInit() {
    setTimeout(() => {
      this.loadCompanies();
    }, 500); // Délai en millisecondesbv

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      this.applyFilterAndPaginate();
    });
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
      if (result.status === 'success' && result.data?.companies) {
        // Traitement des données en cas de succès
        this.companies = result.data.companies;
        this.applyFilterAndPaginate();
        this.isError = false;
        this.isLoading = false;
    
        // Message de succès (optionnel)
        // this.toastService.showSuccess(result.data.message || 'Données chargées avec succès.');
      } else if (result.status === 'error') {
        // Gestion des erreurs
        this.isError = true;
        this.isLoading = false;
        console.error('Erreur lors du chargement des entreprises:', result.error);
       this.toastService.showError('Erreur lors du chargement des entreprises.');
      } else {
        // Autres cas (si nécessaire)
        console.warn('État inattendu:', result);
        this.isLoading = result.isFetching;
      }
    });
    
  }

  applyFilterAndPaginate(): void {
    const isNotInCompanyRoute = this.router.url.includes('/dashboard/companies-not-confirm');
    const isInCompanyRoute = this.router.url.includes('/dashboard/companies');
  
    let filtered = [...this.companies];
  
    // Filtrage par route
    if (isNotInCompanyRoute) {
      filtered = filtered.filter(company => company.isActive === false);
    } else if (isInCompanyRoute) {
      filtered = filtered.filter(company => company.isActive === true);
    }
  
    // Filtrage par recherche
    filtered = filtered.filter(company =>
      company.name.toLowerCase().includes(this.searchName.toLowerCase()) &&
      company.description.toLowerCase().includes(this.searchDesc.toLowerCase()) &&
      company.location.toLowerCase().includes(this.searchLocation.toLowerCase())
    );
  
    // Mise à jour du total et application de la pagination
    this.total = filtered.length;
    const start = (this.pageIndex - 1) * this.pageSize;
    this.filteredCompanies = filtered.slice(start, start + this.pageSize);
  }

  // Fonction de recherche qui émet un événement à chaque changement
  onSearchChange(): void {
    this.searchSubject.next();
  }
  // Changer la page
  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.applyFilterAndPaginate();
  }
  // Changer la taille de la page
  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1; // Revenir à la première page lors du changement de taille
    this.applyFilterAndPaginate();
  }
  // fonction pour creer un company
  openCompanyCreateModal(companyData?: any): void {
    const modalRef = this.modalService.create({
      nzTitle: companyData ? "Modifier l'entreprise" : 'Créer une entreprise',
      nzContent: CompanyCreateComponent,
      nzFooter: null,
      nzWidth: '600px',
      nzData: {
        userData: companyData,
        isEdit: !!companyData,
      },
    });

    // Récupérer les données après la fermeture du modal
    modalRef.afterClose.subscribe((companyDto) => {
      console.log('Données reçues du composant enfant :', companyDto);

      if (companyDto) {
        const {
          id,
          created_at,
          updated_at,
          deleted,
          ...filteredCompanyDto
        } = companyDto;
        const operation = id
          ? this.companyService.updateCompany(id, filteredCompanyDto)
          : this.companyService.createCompany(filteredCompanyDto);

          operation.subscribe({
            next: (user) => {
              if (companyDto.id) {
                // Mise à jour de l'Entreprise existant
                const index = this.companies.findIndex((u) => u.id === user.id);
                if (index !== -1) {
                  this.companies[index] = user;
                }
                this.toastService.showSuccess(
                  'Entreprise mis à jour avec succès.'
                );
              } else {
                // Création d'un nouvel Entreprise
                this.companies.push(user);
                this.toastService.showSuccess('Entreprise créé avec succès.');
              }
              this.applyFilterAndPaginate();
            },
            error: (error) => {
              console.error(
                "Erreur lors de l'opération Entreprise:",
                error.message
              );
              if (error.status === 409) {
                this.toastService.showError(
                  'Un Entreprise avec cet email existe déjà.'
                );
              } else {
                this.toastService.showError(error.message);
              }
            },
          });

        // Traitez les données reçues ici
      }
    });
  }
  // fonction pour voir un company
  viewDetailsCompany(company: any): void {
    this.modalService.create({
      nzTitle: "Détails de l'entreprise",
      nzContent: CompanyDetailsModalComponent,
      nzData: { company },
      nzFooter: null,
    });
  }
  // fonction pour la modification
  editCompany(company: any): void {
    console.log("Modifier l'entreprise:", company);
    // Ajouter votre logique pour modifier l'entreprise
  }

  stepsConfig = [
    {
      title: 'Info Base',
      controls: [
        {
          name: 'name',
          placeholder: 'Nom de la société',
          validators: [Validators.required],
        },
        {
          name: 'description',
          placeholder: 'Description',
          validators: [Validators.required],
        },
        {
          name: 'phone',
          placeholder: 'Téléphone',
          validators: [Validators.required],
        },
        {
          name: 'whatsapp',
          placeholder: 'WhatsApp',
          validators: [Validators.required],
        },
        {
          name: 'location',
          placeholder: 'Localisation',
          validators: [Validators.required],
        },
      ],
    },
    {
      title: 'Liens ',
      controls: [
        { name: 'link_fb', placeholder: 'Lien Facebook', validators: [] },
        { name: 'link_tiktok', placeholder: 'Lien TikTok', validators: [] },
        { name: 'link_insta', placeholder: 'Lien Instagram', validators: [] },
        {
          name: 'link_pinterest',
          placeholder: 'Lien Pinterest',
          validators: [],
        },
        { name: 'link_twit', placeholder: 'Lien Twitter', validators: [] },
        { name: 'link_youtube', placeholder: 'Lien YouTube', validators: [] },
        {
          name: 'link',
          placeholder: 'Site Web',
          validators: [Validators.required],
        },
      ],
    },
    {
      title: 'Couleurs ',
      controls: [
        {
          name: 'primary_color',
          placeholder: 'Couleur principale',
          validators: [Validators.required],
        },
        {
          name: 'secondary_color',
          placeholder: 'Couleur secondaire',
          validators: [],
        },
        {
          name: 'tertiary_color',
          placeholder: 'Couleur tertiaire',
          validators: [],
        },
      ],
    },
    {
      title: 'Statut',
      controls: [
        {
          name: 'isActive',
          placeholder: 'Actif',
          validators: [Validators.required],
        },
        { name: 'deleted', placeholder: 'Supprimé', validators: [] },
      ],
    },
  ];

  // Ouvrir le modal avec des données spécifiques
  openDeleteModal(company: any) {
    const modalData = {
      title: 'Supprimer cette entreprise ?',
      message:
        'Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      callback: () => this.handleDelete(company.id),
    };

    this.deleteModalService.openModal(modalData); // Ouvrir le modal via le service
  }

  handleDelete(companyId: number): void {
    //Logique de suppression via l'API

    this.http
      .delete(`https://api.example.com/companies/${companyId}`)
      .subscribe({
        next: () => {
          console.log('Compagnie supprimée avec succès');
          this.companies = this.companies.filter(
            (company) => company.id !== companyId
          );
          let msg = 'La compagnie spprimer avec succes n0 :';
          this.toastService.showSuccess(msg + companyId);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la compagnie', err);
          this.toastService.showError(
            'Erreur lors de la suppression de la compagnie.'
          );
        },
      });
  }
}

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
import { User } from '../../users/models/user';
import { UserService } from '../../users/services/user.service';
import { UserDetailsModalComponent } from '../../users/components/user-details-modal/user-details-modal.component';
import { RemoveUserFromCompanyDto } from '../models/removeUserFromCompanyDto';
import { UserCompanyService } from '../services/userCompany.service';

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
    private queryClient: QueryClient,
    private userService: UserService,
    private userCompanyService: UserCompanyService
  ) {}
  expandedCompanyId: number | null = null; // Contient l'ID de l'entreprise actuellement affichée ou null.

  toggleDetails(companyId: any): void {
    // Si l'entreprise est déjà affichée, on la referme. Sinon, on ouvre la nouvelle.
    this.expandedCompanyId =
      this.expandedCompanyId === companyId ? null : companyId;
  }
  isExpanded(companyId: any): boolean {
    return this.expandedCompanyId === companyId;
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
        console.error(
          'Erreur lors du chargement des entreprises:',
          result.error
        );
        this.toastService.showError(
          'Erreur lors du chargement des entreprises.'
        );
      } else {
        // Autres cas (si nécessaire)
        console.warn('État inattendu:', result);
        this.isLoading = result.isFetching;
      }
    });
  }

  applyFilterAndPaginate(): void {
    const isNotInCompanyRoute = this.router.url.includes(
      '/dashboard/companies-not-confirm'
    );
    const isInCompanyRoute = this.router.url.includes('/dashboard/companies');

    let filtered = [...this.companies];

    // Filtrage par route
    if (isNotInCompanyRoute) {
      filtered = filtered.filter((company) => company.isActive === false);
    } else if (isInCompanyRoute) {
      filtered = filtered.filter((company) => company.isActive === true);
    }

    // Filtrage par recherche
    filtered = filtered.filter((company) => {
      const name = company.name?.toLowerCase() || '';
      const description = company.description?.toLowerCase() || '';
      const location = company.location?.toLowerCase() || '';

      return (
        name.includes(this.searchName.toLowerCase()) &&
        description.includes(this.searchDesc.toLowerCase()) &&
        location.includes(this.searchLocation.toLowerCase())
      );
    });

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
        companyData: companyData,
        isEdit: !!companyData,
      },
    });

    // Récupérer les données après la fermeture du modal
    modalRef.afterClose.subscribe((companyDto) => {
      if (companyDto) {
        const {
          id,
          created_at,
          updated_at,
          isActive,
          deleted,
          userCompanies,
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
    if (!company.id) {
      this.toastService.showError('ID entreprise non valide');
      return;
    }

    this.companyService.getCompanyById(company.id).subscribe({
      next: (companyDetails) => {
        this.modalService.create({
          nzTitle: "Détails de l'entreprise",
          nzContent: CompanyDetailsModalComponent,
          nzData: { company: companyDetails },
          nzFooter: null,
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails:', error);
        this.toastService.showError(
          "Erreur lors du chargement des détails de l'entreprise."
        );
      },
    });
  }


  openDeleteModal(company: any) {
    if (!company.id) {
      this.toastService.showError('ID utilisateur non valide');
      return;
    }

    const modalData = {
      title: 'Supprimer cette entreprise ?',
      message:
        'Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      callback: () => this.handleDelete(company.id!), // Le '!' indique que nous sommes sûrs que l'id existe
    };

    this.deleteModalService.openModal(modalData);
  }

  handleDelete(companyId: number): void {
    this.companyService.deleteCompany(companyId).subscribe({
      next: () => {
        this.companies = this.companies.filter(
          (company) => company.id !== companyId
        );
        this.applyFilterAndPaginate();
        this.toastService.showSuccess(
          `L'entreprise a été supprimé avec succès.`
        );
      },
      error: (error) => {
        console.error("Erreur lors de la suppression de l'entreprise:", error);
        this.toastService.showError(
          "Erreur lors de la suppression de l'entreprise."
        );
      },
    });
  }

  viewDetailsUser(user: User): void {
    if (!user.id) {
      this.toastService.showError('ID utilisateur non valide');
      return;
    }

    this.userService.findOne(user.id).subscribe({
      next: (userDetails) => {
        this.modalService.create({
          nzTitle: "Détails de l'utilisateur",
          nzContent: UserDetailsModalComponent,
          nzData: { user: userDetails },
          nzFooter: null,
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails:', error);
        this.toastService.showError(
          "Erreur lors du chargement des détails de l'utilisateur."
        );
      },
    });
  }

  openDeleteUserModal(userId: number, companyId: number) {
    if (!userId) {
      this.toastService.showError('ID utilisateur non valide');
      return;
    }
    if (!companyId) {
      this.toastService.showError('ID entreprise non valide');
      return;
    }

    const modalData = {
      title: 'Supprimer cet utilisateur ?',
      message:
        'Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      callback: () => this.handleDeleteUser(userId!, companyId!), // Le '!' indique que nous sommes sûrs que l'id existe
    };

    this.deleteModalService.openModal(modalData);
  }
  updateCompanyUsers(companyId: number, userId: number): void {
    const company = this.companies.find((c) => c.id === companyId);
    if (company) {
      company.userCompanies = company.userCompanies?.filter(
        (uc) => uc.user_id !== userId
      );
    }
  }

  handleDeleteUser(user_id: number, company_id: number): void {
    const dto: RemoveUserFromCompanyDto = {
      userId: user_id,
      companyId: company_id,
    };

    this.userCompanyService.removeUserFromCompany(dto).subscribe({
      next: () => {
        this.updateCompanyUsers(company_id, user_id);
        this.toastService.showSuccess(
          `L'utilisateur a été supprimé avec succès.`
        );
      },
      error: (error) => {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        this.toastService.showError(
          "Erreur lors de la suppression de l'utilisateur."
        );
      },
    });
  }
}

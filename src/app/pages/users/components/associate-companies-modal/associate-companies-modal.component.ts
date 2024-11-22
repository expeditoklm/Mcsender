import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzListComponent, NzListItemComponent } from 'ng-zorro-antd/list';
import { NZ_MODAL_DATA, NzModalComponent, NzModalRef } from 'ng-zorro-antd/modal';
import { CompanyService } from '../../services/company.service';
import { UserCompanyService } from '../../services/userCompany.service';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { firstValueFrom, Subscription } from 'rxjs';
import { NzSpinComponent, NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ToastService } from '../../../../consts/components/toast/toast.service';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { Company } from '../../../companies/models/company';

export interface AssociateUserToCompaniesDto {
  userId: number;
  companyIds: number[];
}

@Component({
  selector: 'app-associate-companies-modal',
  standalone: true,
  imports: [
    CommonModule,
    NzInputGroupComponent,
    NzListComponent,
    FormsModule,
    ReactiveFormsModule,
    NzListItemComponent,
    NzSpinModule,
    NzIconModule,
  ],
  templateUrl: './associate-companies-modal.component.html',
  styleUrl: './associate-companies-modal.component.css',
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class AssociateCompaniesModalComponent implements OnInit, OnDestroy {
  @Input() user: any;
  @Output() companiesSelected = new EventEmitter<{ user: any, selectedCompanies: any[] }>();

  searchQuery: string = '';
  companies: any[] = [];
  filteredCompanies: any[] = [];
  selectedCompanies: any[] = [];
  userCompanies: any[] = [];
  isLoading: boolean = false;
  isLoadingCompanies: boolean = false;
  isError = false;
  private companiesSubscription: Subscription | null = null;
  private userCompaniesSubscription: Subscription | null = null;

  constructor(
    private modal: NzModalRef,
    private companyService: CompanyService,
    private userCompanyService: UserCompanyService,
    private toastService: ToastService,
    private queryClient: QueryClient, 
    private cdr: ChangeDetectorRef, // Importer
    @Inject(NZ_MODAL_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.user = this.data.user;
    setTimeout(() => {
      this.loadCompanies();
    }, 500); // Délai en millisecondesbv 
  }

  ngOnDestroy(): void {
    this.companiesSubscription?.unsubscribe();
    this.userCompaniesSubscription?.unsubscribe();
  }

  loadCompanies() {
    this.isLoading = true;
    const queryObserver = new QueryObserver<Company[]>(this.queryClient, {
      queryKey: ['companies'],
      queryFn: async () => {
        return await firstValueFrom(this.companyService.getAllCompanies());
      }
    });


    queryObserver.subscribe((response:any) => {
      if (response.error) {
        this.isError = true;
        console.error('Error fetching  companies:', response.error);
        this.toastService.showError('Impossible de charger les entreprises.');
        this.companies = [];
        this.filteredCompanies = [];
        this.isLoading = false;
      }else if (response.data) {
        this.companies = response.data.companies || [];
        this.filteredCompanies = [...this.companies];
        this.toastService.showSuccess('Liste des entreprises chargée avec succès.');
        this.loadUserCompanies();
        this.isError = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadUserCompanies() {
    this.isLoadingCompanies = true;
    const queryObserver = new QueryObserver<Company[]>(this.queryClient, {
      queryKey: ['userCompanies', this.user.id],
      queryFn: async () => {
        return await firstValueFrom(this.userCompanyService.getAllCompanyForUser(this.user.id));
      }
    });


    queryObserver.subscribe((result) => {
      if (result.error) {
        console.error('Erreur lors du chargement des entreprises associées', result.error);
          this.toastService.showError('Impossible de charger les entreprises associées.');
          this.isLoadingCompanies = false;
      } else {
        this.userCompanies = result.data || [];
        this.preSelectUserCompanies(); // Pré-sélectionne après chargement
        this.isLoadingCompanies = false;
      }
    });

  }

  preSelectUserCompanies() {
    if (this.companies.length > 0 && this.userCompanies.length > 0) {
      const userCompanyIds = this.userCompanies.map((uc: any) =>
        typeof uc === 'number' ? uc : uc.company_id
      );

      this.selectedCompanies = this.companies.filter((company: any) =>
        userCompanyIds.includes(company.id)
      );

      this.toastService.showSuccess(`${this.selectedCompanies.length} entreprises déjà associées pré-sélectionnées.`);
    }
  }

  searchCompanies() {
    this.filteredCompanies = this.searchQuery
      ? this.companies.filter((company) =>
          company.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      : this.companies;
  }

  toggleCompanySelection(company: any) {
    const index = this.selectedCompanies.findIndex(c => c.id === company.id);
    if (index === -1) {
      this.selectedCompanies.push(company);
    } else {
      this.selectedCompanies.splice(index, 1);
    }
  }

  isSelected(company: any): boolean {
    return this.selectedCompanies.some((selectedCompany) => selectedCompany.id === company.id);
  }

  removeCompany(company: any) {
    this.selectedCompanies = this.selectedCompanies.filter(c => c.id !== company.id);
  }

  submit() {
    const dto: AssociateUserToCompaniesDto = {
      userId: this.user.id,
      companyIds: this.selectedCompanies.map(company => company.id),
    };

    if (dto.companyIds.length === 0) {
      // this.toastService.showWarning('Aucune entreprise sélectionnée, la liste sera vidée.');
    }

    this.isLoading = true;
    this.userCompanyService.associateUserToCompanies(dto).subscribe({
      next: (response) => {
        console.log('Réponse API :', response);
        this.toastService.showSuccess('Associations enregistrées avec succès.');
        this.companiesSelected.emit({
          user: this.user,
          selectedCompanies: this.selectedCompanies,
        });
        this.modal.close();
      },
      error: (error) => {
        console.error('Erreur lors de l\'association des entreprises', error);
        this.toastService.showError('Impossible d\'enregistrer les associations.');
        this.isLoading = false;
      }
    });
  }

  cancel() {
    this.modal.close();
  }
}

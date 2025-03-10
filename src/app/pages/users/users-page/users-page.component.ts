import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import {
  debounceTime,
  Subject,
  finalize,
  firstValueFrom,
  Subscription,
} from 'rxjs';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Router, RouterModule } from '@angular/router';
import { User } from '../models/user';
import { UserDetailsModalComponent } from '../components/user-details-modal/user-details-modal.component';
import { UserCreateComponent } from '../components/user-create/user-create.component';
import { DeleteModalService } from '../../../consts/components/delete-modal/delete-modal.service';
import { ToastService } from '../../../consts/components/toast/toast.service';
import { UpdateUserDto, UserService } from '../services/user.service';
import { AssociateCompaniesModalComponent } from '../components/associate-companies-modal/associate-companies-modal.component';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CreateUserCompanyDto } from '../models/UserCompanyDto';
import { Roles } from '../../../consts/role';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-users-page',
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
    NzOptionComponent,
    ReactiveFormsModule,
    NzStepsModule,
    NzStepsModule,
    NzFormModule,
    NzGridModule,
    NzSelectComponent,
  ],

  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.css',
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
  export class UsersPageComponent implements OnInit {
    users: User[] = [];
    roles = Roles;
    tabRoles = Object.values(Roles);
    filteredUsers: User[] = [];
    isLoading = false;
    isError = false;
    searchName = '';
    searchUserName = '';
    searchEmail = '';
    searchRole = '';
    pageIndex = 1;
    pageSize = 2;
    total = 0;
    isModalVisible = false;
    private searchSubject: Subject<void> = new Subject();
    private queryObserver?: QueryObserver<any>;
    private subscription: Subscription | null = null;
    private unsubscribeFn: () => void = () => {};


  






    constructor(
      private modalService: NzModalService,
      private cdr: ChangeDetectorRef,
      private router: Router,
      private deleteModalService: DeleteModalService,
      private toastService: ToastService,
      private userService: UserService,
      private queryClient: QueryClient
    ) {
      
    }

  getRoleLabel(role: string): string {
    switch (role) {
      case Roles.SUPER_ADMIN:
        return 'Super-Admin';
      case Roles.ADMIN:
        return 'Administrateur';
      case Roles.USER:
        return 'Utilisateur';
      default:
        return role;
    }
  }

  ngOnInit() {
    this.loadUsers();

    this.setupSearchDebounce();
  }
  private setupSearchDebounce() {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      this.loadUsers();
    });
  }

  loadUsers() {
    this.isLoading = true;
    
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
    }

    this.queryObserver = this.userService.createUsersQueryObserver({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      searchName: this.searchName,
      searchUserName: this.searchUserName,
      searchEmail: this.searchEmail,
      searchRole: this.searchRole
    });

    this.unsubscribeFn = this.queryObserver.subscribe((result) => {
      if (result.error) {
        this.isError = true;
        this.toastService.showError('Erreur lors du chargement des utilisateurs.');
      } else {
        this.users = result.data?.data || [];
        this.total = result.data?.total;
        this.filteredUsers = [...this.users];
        this.isError = false;
        this.isLoading = result.isFetching;
        this.cdr.detectChanges();
      }
    });
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.loadUsers();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.loadUsers();
  }

  

  handleResult(result: any) {
    if (result.error) {
      this.isError = true;
      this.isLoading = false;
      this.toastService.showError(
        'Erreur lors du chargement des utilisateurs.'
      );
      return;
    }

    this.users = result.data?.data || [];
    this.total = result.data?.total || 0;

    const isNotInCompanyRoute = this.router.url.includes(
      '/dashboard/users-not-in-company'
    );
    const isInCompanyRoute = this.router.url.includes('/dashboard/users');

    let filtered = [...this.users];

    if (isNotInCompanyRoute) {
      filtered = filtered.filter((user) => user.role === Roles.USER);
    } else if (isInCompanyRoute) {
      filtered = filtered.filter(
        (user) => user.role === Roles.ADMIN || user.role === Roles.SUPER_ADMIN
      );
    }

    const start = (this.pageIndex - 1) * this.pageSize;
    this.filteredUsers = filtered.slice(start, start + this.pageSize);

    this.isError = false;
    this.isLoading = false;
  }

  onSearchChange(): void {
    this.searchSubject.next();
  }


  ngOnDestroy() {
    // Nettoyage de l'abonnement
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
    }
    this.searchSubject.complete()
  }


  openUserCreateModal(userData?: any): void {
    const modalRef = this.modalService.create({
      nzTitle: userData ? "Modifier l'utilisateur" : 'Créer un utilisateur',
      nzContent: UserCreateComponent,
      nzFooter: null,
      nzWidth: '600px',
      nzData: {
        userData: userData,
        isEdit: !!userData,
      },
    });

    modalRef.afterClose.subscribe((userDto) => {
      if (userDto) {
        const {
          id,
          created_at,
          updated_at,
          userCompanies,
          deleted,
          password,
          ...filteredUserDto
        } = userDto;
        if (!id) {
          filteredUserDto.password = '12345678';
        }
        const operation = id
          ? this.userService.update(id, filteredUserDto)
          : this.userService.create(filteredUserDto);

        operation.subscribe({
          next: (user) => {
            if (userDto.id) {
              // Mise à jour de l'utilisateur existant
              const index = this.users.findIndex((u) => u.id === user.id);
              if (index !== -1) {
                this.users[index] = user;
              }
              this.toastService.showSuccess(
                'Utilisateur mis à jour avec succès.'
              );
            } else {
              // Création d'un nouvel utilisateur
              this.users.push(user);
              this.toastService.showSuccess('Utilisateur créé avec succès.');
            }
            this.loadUsers();
          },
          error: (error) => {
            console.error(
              "Erreur lors de l'opération utilisateur:",
              error.message
            );
            if (error.status === 409) {
              this.toastService.showError(
                'Un utilisateur avec cet email existe déjà.'
              );
            } else {
              this.toastService.showError(error.message);
            }
          },
        });
      }
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

  openDeleteModal(user: User) {
    if (!user.id) {
      this.toastService.showError('ID utilisateur non valide');
      return;
    }

    const modalData = {
      title: 'Supprimer cet utilisateur ?',
      message:
        'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      callback: () => this.handleDelete(user.id!), // Le '!' indique que nous sommes sûrs que l'id existe
    };

    this.deleteModalService.openModal(modalData);
  }

  
 

  handleDelete(userId: number): void {
    this.userService.remove(userId).subscribe({
      next: () => {
        this.users = this.users.filter((user) => user.id !== userId);
        this.loadUsers();
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

  openAssociateCompaniesModal(user: User): void {
    // Vérification préalable de l'existence de l'id
    if (!user.id) {
      this.toastService.showError('ID utilisateur non valide');
      return;
    }

    const modalRef = this.modalService.create({
      nzTitle: `Associer des entreprises à ${user.name}`,
      nzContent: AssociateCompaniesModalComponent,
      nzFooter: null,
      nzWidth: '600px',
      nzData: { user },
    });

    modalRef.afterClose.subscribe((result: { company_id: number }) => {
      if (result && user.id) {
        // Double vérification de user.id
        const createUserCompanyDto: CreateUserCompanyDto = {
          user_id: user.id,
          company_id: result.company_id,
        };
      }
    });
  }
}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule } from '@angular/forms';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { debounceTime, Subject, finalize } from 'rxjs';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Router, RouterModule } from '@angular/router';
import { User } from '../models/user';
import { UserDetailsModalComponent } from '../components/user-details-modal/user-details-modal.component';
import { UserCreateComponent } from '../components/user-create/user-create.component';
import { DeleteModalService } from '../../../consts/components/delete-modal/delete-modal.service';
import { ToastService } from '../../../consts/components/toast/toast.service';
import { CreateUserCompanyDto, UserService } from '../services/user.service';
import { AssociateCompaniesModalComponent } from '../components/associate-companies-modal/associate-companies-modal.component';

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
  ],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.css'
})

export class UsersPageComponent implements OnInit {

  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = false;
  searchName = '';
  searchEmail = '';
  searchRole = '';
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
    private userService: UserService
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      this.filterUsers();
    });
    
    this.loadUsers();
    
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.findAll()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.filterUsers();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          this.toastService.showError('Erreur lors du chargement des utilisateurs.');
        }
      });
  }

  filterUsers(): void {
    const isNotInCompanyRoute = this.router.url.includes('/dashboard/users-not-in-company');
    const isInCompanyRoute = this.router.url.includes('/dashboard/users');

    let filtered = [...this.users];

    // Filtrage par route
    if (isNotInCompanyRoute) {
      filtered = filtered.filter(user => user.role === 'USER'  );
    } else if (isInCompanyRoute) {
      filtered = filtered.filter(user => user.role == 'ADMIN' ||  user.role == 'SUPER-ADMIN' );
    }

    // Filtrage par recherche
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(this.searchName.toLowerCase()) &&
      user.email.toLowerCase().includes(this.searchEmail.toLowerCase()) &&
      user.role.toLowerCase().includes(this.searchRole.toLowerCase())
    );

    this.total = filtered.length;
    const start = (this.pageIndex - 1) * this.pageSize;
    this.filteredUsers = filtered.slice(start, start + this.pageSize);
  }

  onSearchChange(): void {
    this.searchSubject.next();
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.filterUsers();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.filterUsers();
  }

  openUserCreateModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: 'Créer un utilisateur',
      nzContent: UserCreateComponent,
      nzFooter: null,
      nzWidth: '600px',
    });

    modalRef.afterClose.subscribe((createUserDto) => {
      if (createUserDto) {
        this.userService.create(createUserDto).subscribe({
          next: (newUser) => {
            this.users.push(newUser);
            this.filterUsers();
            this.toastService.showSuccess('Utilisateur créé avec succès.');
          },
          error: (error) => {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            this.toastService.showError('Erreur lors de la création de l\'utilisateur.');
          }
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
          nzTitle: 'Détails de l\'utilisateur',
          nzContent: UserDetailsModalComponent,
          nzData: { user: userDetails },
          nzFooter: null
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails:', error);
        this.toastService.showError('Erreur lors du chargement des détails de l\'utilisateur.');
      }
    });
  }

  openDeleteModal(user: User) {
    if (!user.id) {
      this.toastService.showError('ID utilisateur non valide');
      return;
    }

    const modalData = {
      title: 'Supprimer cet utilisateur ?',
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      callback: () => this.handleDelete(user.id!),  // Le '!' indique que nous sommes sûrs que l'id existe
    };

    this.deleteModalService.openModal(modalData);
  }

  handleDelete(userId: number): void {
    this.userService.remove(userId).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== userId);
        this.filterUsers();
        this.toastService.showSuccess(`L'utilisateur a été supprimé avec succès.`);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        this.toastService.showError('Erreur lors de la suppression de l\'utilisateur.');
      }
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
      if (result && user.id) { // Double vérification de user.id
        const createUserCompanyDto: CreateUserCompanyDto = {
          user_id: user.id,
          company_id: result.company_id
        };
        
        this.userService.createUserCompany(createUserCompanyDto).subscribe({
          next: () => {
            this.toastService.showSuccess('Association créée avec succès.');
            this.loadUsers();
          },
          error: (error) => {
            console.error('Erreur lors de l\'association:', error);
            this.toastService.showError('Erreur lors de l\'association avec l\'entreprise.');
          }
        });
      }
    });
  }


  editUser(user: User): void {
    // Implement edit logic using userService.update()
    console.log('Modifier l\'utilisateur:', user);
  }


  ngOnDestroy() {
    // Nettoyage du Subject pour éviter les fuites de mémoire
    this.searchSubject.complete();
  }

}
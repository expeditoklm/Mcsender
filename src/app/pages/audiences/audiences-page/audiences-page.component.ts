import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule } from '@angular/forms';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { debounceTime, Subject } from 'rxjs';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Router, RouterModule } from '@angular/router';
import { UserDetailsModalComponent } from '../../users/components/user-details-modal/user-details-modal.component';
import { UserCreateComponent } from '../../users/components/user-create/user-create.component';
import { User } from '../../users/models/user';
import { DeleteModalService } from '../../../consts/components/delete-modal/delete-modal.service';
import { ToastService } from '../../../consts/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';

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
  styleUrl: './audiences-page.component.css'
})
export class AudiencesPageComponent implements OnInit {

  constructor(
    private modalService: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private deleteModalService: DeleteModalService,
    private toastService: ToastService,
    private http: HttpClient
  ) {}

  users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Employee', username: '123-456', created_at: '2023-01-01' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Employee', username: '789-012', created_at: '2023-01-02' },
    { id: 3, name: 'Michael Johnson', email: 'michael@example.com', role: 'Moderator', username: '987-654', created_at: '2023-01-03' }
  ];

  searchName = '';
  searchEmail = '';
  searchRole = '';

  pageIndex = 1;
  pageSize = 5;
  total = this.users.length;
  isModalVisible = false;
  private searchSubject: Subject<void> = new Subject();

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      this.applyFilter();
    });
    this.applyFilter();
  }

  // Méthode pour filtrer les utilisateurs en fonction de la route actuelle
  applyFilter(): void {
    const isNotInCompanyRoute = this.router.url.includes('/dashboard/users-not-in-company');
    const isInCompanyRoute = this.router.url.includes('/dashboard/users');

    if (isNotInCompanyRoute) {
      // Filtrer uniquement les utilisateurs qui ne sont pas dans l'entreprise
      this.users = this.users.filter(user => user.role !== 'Employee');
    } else if (isInCompanyRoute) {
      // Filtrer uniquement les utilisateurs qui sont dans l'entreprise
      this.users = this.users.filter(user => user.role === 'Employee');
    }

    this.total = this.users.length;
  }

  // Fonction de recherche
  onSearchChange(): void {
    this.searchSubject.next();
  }

  // Filtrage des utilisateurs
  get filteredUsers(): User[] {
    const filtered = this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchName.toLowerCase()) &&
      user.email.toLowerCase().includes(this.searchEmail.toLowerCase()) &&
      user.role.toLowerCase().includes(this.searchRole.toLowerCase())
    );

    this.total = filtered.length;
    const start = (this.pageIndex - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  // Pagination
  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
  }

  // Création d'un utilisateur
  openUserCreateModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: 'Créer un utilisateur',
      nzContent: UserCreateComponent,
      nzFooter: null,
      nzWidth: '600px',
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.users.push(result); // Ajouter l'utilisateur créé
        this.applyFilter(); // Réappliquer le filtre
      }
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

  // Modifier un utilisateur
  editUser(user: any): void {
    console.log('Modifier l\'utilisateur:', user);
  }

  // Supprimer un utilisateur
  deleteUser(user: any): void {
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  confirmDelete(): void {
    console.log('Utilisateur supprimé');
    this.closeModal();
  }

  goToContacts(user: any): void {
    const queryParams = {
      audience: user.name,
      campagne: user.email, // Remplacez par le champ correspondant à la campagne
      entreprise: user.role // Remplacez par le champ correspondant à l'entreprise
    };
  
    this.router.navigate(['/dashboard/contacts'], { queryParams });
  }
  
}


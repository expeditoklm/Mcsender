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
import { UserDetailsModalComponent } from '../pages/users/components/user-details-modal/user-details-modal.component';
import { UserCreateComponent } from '../pages/users/components/user-create/user-create.component';
import { CompanyCreateComponent } from '../pages/companies/components/company-create/company-create.component';
import { CompanyDetailsModalComponent } from '../pages/companies/components/company-details-modal/company-details-modal.component';
import { DeleteModalService } from '../consts/components/delete-modal/delete-modal.service';
import { ToastService } from '../consts/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';


interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  company: string;
  createdAt: string;
  status: string;
  detailsVisible: boolean;
}

@Component({
  selector: 'app-users',
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
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
}) 

export class UsersComponent implements OnInit {
  constructor(private modalService: NzModalService,
    private cdr: ChangeDetectorRef,
    private deleteModalService: DeleteModalService,
    private toastService: ToastService,
    private http: HttpClient
  ) {} 

  users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', phone: '123-456', address: '123 Main St', company: 'Company A', createdAt: '2023-01-01', status: 'Active', detailsVisible: false },
    { id: 2, name: 'Jh', email: 'jane@example.com', role: 'User', phone: '789-012', address: '456 Elm St', company: 'Company B', createdAt: '2023-01-02', status: 'Inactive', detailsVisible: false },
    { id: 3, name: 'Michael Johnson', email: 'michael@example.com', role: 'Moderator', phone: '987-654', address: '789 Oak St', company: 'Company C', createdAt: '2023-01-03', status: 'Active', detailsVisible: false },
    { id: 1, name: 'JuklmDoe', email: 'john@example.com', role: 'Admin', phone: '123-456', address: '123 Main St', company: 'Company A', createdAt: '2023-01-01', status: 'Active', detailsVisible: false },
    { id: 2, name: 'J8963.e Smith', email: 'jane@example.com', role: 'User', phone: '789-012', address: '456 Elm St', company: 'Company B', createdAt: '2023-01-02', status: 'Inactive', detailsVisible: false },
    { id: 3, name: 'Mhjkl:l Johnson', email: 'michael@example.com', role: 'Moderator', phone: '987-654', address: '789 Oak St', company: 'Company C', createdAt: '2023-01-03', status: 'Active', detailsVisible: false },
    { id: 1, name: 'ghjk Doe', email: 'john@example.com', role: 'Admin', phone: '123-456', address: '123 Main St', company: 'Company A', createdAt: '2023-01-01', status: 'Active', detailsVisible: false },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', phone: '789-012', address: '456 Elm St', company: 'Company B', createdAt: '2023-01-02', status: 'Inactive', detailsVisible: false },
    { id: 3, name: 'M963l Johnson', email: 'michael@example.com', role: 'Moderator', phone: '987-654', address: '789 Oak St', company: 'Company C', createdAt: '2023-01-03', status: 'Active', detailsVisible: false },
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', phone: '123-456', address: '123 Main St', company: 'Company A', createdAt: '2023-01-01', status: 'Active', detailsVisible: false },
    { id: 2, name: 'J852 Smith', email: 'jane@example.com', role: 'User', phone: '789-012', address: '456 Elm St', company: 'Company B', createdAt: '2023-01-02', status: 'Inactive', detailsVisible: false },
    { id: 3, name: '63.ael Johnson', email: 'michael@example.com', role: 'Moderator', phone: '987-654', address: '789 Oak St', company: 'Company C', createdAt: '2023-01-03', status: 'Active', detailsVisible: false },
    
  ];

  searchName = '';
  searchEmail = '';
  searchRole = '';

  pageIndex = 1;
  pageSize = 1;
  total = this.users.length;
  isVisible = false;

  issVisible: boolean = false;


  private searchSubject: Subject<void> = new Subject();

  ngOnInit() {
    // Exécution après un délai de 300ms lors de la saisie dans les champs de recherche
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1; // Reset page index when search changes
      this.total = this.users.length; 
    });
  }

  // Fonction de filtrage des utilisateurs
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

  // Toggle pour afficher/masquer les détails de l'utilisateur
  toggleDetails(user: User): void {
    user.detailsVisible = !user.detailsVisible;
  }

  // Fonction d'ajout d'un utilisateur
  addUser(): void {
    // Exemple d'ajout d'un utilisateur
    const newUser: User = {
      id: this.users.length + 1,
      name: 'New User',
      email: 'newuser@example.com',
      role: 'User',
      phone: '555-555',
      address: '123 New St',
      company: 'New Company',
      createdAt: new Date().toISOString(),
      status: 'Active',
      detailsVisible: false
    };
    this.users.push(newUser);
    this.total = this.users.length; // Mettre à jour le total
  }

  // Fonction de recherche qui émet un événement à chaque changement
  onSearchChange(): void {
    this.searchSubject.next();
  }

  // Changer la page
  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  // Changer la taille de la page
  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1; // Revenir à la première page lors du changement de taille
  }

 
  
  editUser(user: any): void {
    console.log('Modifier l\'utilisateur:', user);
    // Ajouter votre logique pour modifier l'utilisateur
  }
  


  openModal(): void {
  
    const modalRef = this.modalService.create({
      nzTitle: 'Ajouter un Utilisateur',
      nzContent: CompanyCreateComponent, // Le formulaire va ici
      nzFooter: null // Pour ne pas afficher le footer par défaut
    });
  }


  viewDetailsUser(user: any): void {
    this.modalService.create({
      nzTitle: 'Détails de l\'utilisateur',
      nzContent: CompanyDetailsModalComponent,
      nzData: { user },
      nzFooter: null
    });
  }

  openUserCreateModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: 'Créer un utilisateur',
      nzContent: UserCreateComponent,
      nzFooter: null,
      nzData: {
        userData: { name: '', email: '', role: '' },
      },
      nzWidth: '600px',
    });

    // Récupérer les données après la fermeture du modal
    modalRef.afterClose.subscribe((result) => {
      if (result) {
        console.log('Données reçues du composant enfant :', result);
        // Traitez les données reçues ici
      }
    });
  }
  




  isModalVisible = false;
  userToDelete: any = null;

  deleteUser(user: any): void {
    this.userToDelete = user;
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  confirmDelete(): void {
    console.log('Utilisateur supprimé :', this.userToDelete);
    this.closeModal();
  }




  
}


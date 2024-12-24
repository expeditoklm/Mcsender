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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { User } from '../../users/models/user';
import { UserCreateComponent } from '../../users/components/user-create/user-create.component';
import { UserDetailsModalComponent } from '../../users/components/user-details-modal/user-details-modal.component';
import { DeleteModalService } from '../../../consts/components/delete-modal/delete-modal.service';
import { ToastService } from '../../../consts/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { CreateContactDto } from '../models/CreateContactDto';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { ContactService } from '../services/contact.service';
import { ContactUpdateComponent } from '../components/contact-update/contact-update.component';

@Component({
  selector: 'app-contacts-page',
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
  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.css',
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class ContactsPageComponent implements OnInit {

  constructor(
    private modalService: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private deleteModalService: DeleteModalService,
    private toastService: ToastService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private queryClient: QueryClient,
    private contactService: ContactService

  ) {}

  expandedContactId: number | null = null; // Contient l'ID de l'entreprise actuellement affichée ou null.



  contacts: CreateContactDto[] = [];
  filteredContacts: CreateContactDto[] = [];
  isLoading = false;
  isError = false;

  searchAudience = '';
  searchCompany = '';
  searchNamePrenom = '';
  searchEmailTelephone = '';

  pageIndex = 1;
  pageSize = 5;
  total = this.contacts.length;
  isModalVisible = false;
  private searchSubject: Subject<void> = new Subject();

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params['audience']) {
        this.searchAudience = params['audience'];
      }
     
      if (params['entreprise']) {
        this.searchCompany = params['entreprise'];
      }
      this.filterContacts();
    });

    setTimeout(() => {
      this.loadContacts();
    }, 500);

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      this.filterContacts();
    });
  }


  toggleDetails(contactId: any): void {
    this.expandedContactId = this.expandedContactId === contactId ? null : contactId;
  
    if (this.expandedContactId) {
      this.loadAudiencesForContact(contactId);
    }
  }
  isExpanded(contactId: any): boolean {
    return this.expandedContactId === contactId;
  }

  loadAudiencesForContact(contactId: number): void {
    this.contactService.getAudiencesByContact(contactId).subscribe(
      (audiences) => {
        const contact = this.contacts.find(c => c.id === contactId);
        if (contact) {
          contact.audienceContacts = audiences; // Assurez-vous que `audienceContacts` existe dans le modèle.
        }
      },
      (error) => {
        console.error(`Erreur lors du chargement des audiences pour le contact ${contactId}:`, error);
        this.toastService.showError('Impossible de charger les audiences.');
      }
    );
  }
  
  loadContacts() {
    this.isLoading = true;
    const queryObserver = new QueryObserver<any>(this.queryClient, {
      queryKey: ['contactsList'],
      queryFn: async () => {
        return await firstValueFrom(this.contactService.getAllContacts());
      },
    });
  
    queryObserver.subscribe((result) => {
      if (result.error) {
        this.isError = true;
        console.error('Erreur lors du chargement des contacts:', result.error);
        this.toastService.showError('Erreur lors du chargement des contacts.');
      } else {
        if (result.data && Array.isArray(result.data)) {
          // Transformer la donnée si nécessaire
          this.contacts = result.data ; // Adaptez à l'objet avec la propriété `contacts`
          //console.log('this.contacts:', this.contacts);
  
          this.filterContacts(); // Appliquez un filtrage ou une logique additionnelle si nécessaire
        } else {
          console.warn('Format inattendu des données :', result.data);
          this.contacts = []; // Initialisez un tableau vide pour éviter des erreurs plus loin
        }
  
        this.isError = false;
        this.isLoading = false; // Assurez-vous de stopper le chargement
      }
    });
  }
  
  // Fonction de recherche
  onSearchChange(): void {
    this.searchSubject.next();
  }

  // Filtrage des utilisateurs
  filterContacts(): void {
    let filtered = [...this.contacts];
    filtered = filtered.filter(contact =>
      (contact.name && contact.name.toLowerCase().includes(this.searchNamePrenom.toLowerCase())) ||
      (contact.username && contact.username.toLowerCase().includes(this.searchNamePrenom.toLowerCase())) &&
      (contact.email && contact.email.toLowerCase().includes(this.searchEmailTelephone.toLowerCase())) ||
      (contact.phone && contact.phone.toLowerCase().includes(this.searchEmailTelephone.toLowerCase()))&&
      (contact.company && contact.company.toLowerCase().includes(this.searchCompany.toLowerCase()))&&
      (contact.audience && contact.audience.toLowerCase().includes(this.searchAudience.toLowerCase()))
    );

    console.log("filtered",filtered)

    this.total = filtered.length;
    const start = (this.pageIndex - 1) * this.pageSize;
    this.filteredContacts = filtered.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
  }

  // Pagination
  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.filterContacts();

  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.filterContacts();
  }

  openContactUpdateModal(contactData: any): void {
      const modalRef = this.modalService.create({
        nzTitle:  "Modifier la campagne" ,
        nzContent: ContactUpdateComponent,
        nzFooter: null,
        nzWidth: '600px',
        nzData: {
          contactData: contactData,
        },
      });
  
      modalRef.afterClose.subscribe((contactDto) => {
        if (contactDto) {
          const { id, created_at, updated_at, deleted, ...filteredCampaignDto } = contactDto;
          const operation = this.contactService.updateContact(id, filteredCampaignDto)
          operation.subscribe({
            next: (contact) => {
                const index = this.contacts.findIndex((u) => u.id === contact.id);
                if (index !== -1) {
                  this.contacts[index] = contact;
                }
                this.filterContacts();
                this.toastService.showSuccess('contact mise à jour avec succès.');
            },
            error: (e: any) => {
              console.error('Erreur lors de l\'opération contact :', e.error.message);
              this.toastService.showError(e.error.message);
            },
          });
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
}

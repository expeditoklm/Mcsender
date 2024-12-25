import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule } from '@angular/forms';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { debounceTime, distinctUntilChanged, firstValueFrom, Subject } from 'rxjs';
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
    // Charger les contacts d'abord
    this.loadContacts(() => {
      // Ensuite, écouter les paramètres de l'URL
      this.route.queryParams.subscribe((params) => {
        if (params['audience']) {
          this.searchAudience = params['audience'];
          console.log("Audience préremplie:", this.searchAudience);
        }
        if (params['entreprise']) {
          this.searchCompany = params['entreprise'];
          console.log("Entreprise préremplie:", this.searchCompany);
        }
        // Déclencher manuellement un événement de recherche
        this.searchSubject.next(); // Force le filtrage après mise à jour des champs
      });
      // Filtrer une première fois si aucun paramètre n'est fourni
      this.filterContacts();
    });
    // Configurer le sujet pour les changements des champs de recherche
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      console.log("Événement reçu dans searchSubject");
      this.filterContacts();
    });
  }
  
  
  
  
  

  toggleDetails(contactId: any): void {
    this.expandedContactId =
      this.expandedContactId === contactId ? null : contactId;

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
          contact.audienceContacts = audiences;
          // Associer les noms des audiences
          contact.audience = audiences.map(audience => audience.name).join(', ');
  
          // Associer les noms des entreprises
          contact.company = audiences
            .map(audience => audience.company?.name || '') // Vérifie si la compagnie existe
            .filter(companyName => companyName) // Filtrer les valeurs vides
            .join(', ');
        }
      },
      (error) => {
        console.error(`Erreur lors du chargement des audiences pour le contact ${contactId}:`, error);
        this.toastService.showError('Impossible de charger les audiences.');
      }
    );
  }
  

  loadContacts(callback?: () => void) {
    this.isLoading = true;
    const queryObserver = new QueryObserver<any>(this.queryClient, {
      queryKey: ['contactsList'],
      queryFn: async () => {
        return await firstValueFrom(this.contactService.getAllContacts());
      },
    });
  
    queryObserver.subscribe((result) => {
      console.log(result.data)
      if (result.error) {
        this.isError = true;
        console.error('Erreur lors du chargement des contacts:', result.error);
        this.toastService.showError('Erreur lors du chargement des contacts.');
      } else {
        if (result.data && Array.isArray(result.data)) {
          this.contacts = result.data;
        } else {
          console.warn('Format inattendu des données :', result.data);
          this.contacts = [];
        }
  
        this.isError = false;
        this.isLoading = false;
  
        // Exécuter le callback si défini
        if (callback) {
          callback();
        }
      }
    });
  }
  

  // Fonction de recherche
  onSearchChange(): void {
    this.searchSubject.next();
  }

  filterContacts(): void {
    if (!this.contacts || this.contacts.length === 0) {
      console.warn('Aucun contact disponible pour le filtrage.');
      return;
    }
  
    // Étape 1 : Charger les audiences pour chaque contact
    this.contacts.forEach((contact: any) => {
      this.loadAudiencesForContact(contact.id);
    });
  
    // Étape 2 : Associer les noms des audiences et entreprises
    this.contacts.forEach(contact => {
      if (contact.audienceContacts) {
        contact.audience = contact.audienceContacts.map(audience => audience.name).join(', ');
        contact.company = contact.audienceContacts
          .map((audience: any) => audience.companyName)
          .join(', ');
      }
    });
  
    // Étape 3 : Appliquer le filtrage
    let filtered = [...this.contacts];
    filtered = filtered.filter(contact => {
      const nameOrUsernameMatch = contact.name?.toLowerCase().includes(this.searchNamePrenom.toLowerCase()) ||
                                  contact.username?.toLowerCase().includes(this.searchNamePrenom.toLowerCase());
  
      const emailOrPhoneMatch = contact.email?.toLowerCase().includes(this.searchEmailTelephone.toLowerCase()) ||
                                contact.phone?.toLowerCase().includes(this.searchEmailTelephone.toLowerCase());
  
      const companyMatch = !this.searchCompany || contact.company?.toLowerCase().includes(this.searchCompany.toLowerCase());
      const audienceMatch = !this.searchAudience || contact.audience?.toLowerCase().includes(this.searchAudience.toLowerCase());
     
      return nameOrUsernameMatch && emailOrPhoneMatch && companyMatch && audienceMatch;
    });

    // Pagination
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
      nzTitle: 'Modifier le contact',
      nzContent: ContactUpdateComponent,
      nzFooter: null,
      nzWidth: '600px',
      nzData: {
        contactData: contactData,
      },
    });

    modalRef.afterClose.subscribe((contactDto) => {
      if (contactDto) {
        const { id, created_at, updated_at, deleted,audienceContacts,audience,company, ...filteredContactDto } =
          contactDto;
        const operation = this.contactService.updateContact(
          id,
          filteredContactDto
        );
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
            console.error(
              "Erreur lors de l'opération contact :",
              e.error.message
            );
            this.toastService.showError(e.error.message);
          },
        });
      }
    });
  }

  openDeleteModal(contact: any) {
    if (!contact.id) {
      this.toastService.showError('ID du contact non valide');
      return;
    }

    const modalData = {
      title: 'Supprimer ce contact ?',
      message:
        'Êtes-vous sûr de vouloir supprimer ce contact ? Cette action est irréversible.',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      callback: () => this.handleDelete(contact.id!), // Le '!' indique que nous sommes sûrs que l'id existe
    };

    this.deleteModalService.openModal(modalData);
  }

  handleDelete(contactId: number): void {
    this.contactService.deleteContact(contactId).subscribe({
      next: () => {
        this.contacts = this.contacts.filter(
          (contact) => contact.id !== contactId
        );
        this.filterContacts();
        this.toastService.showSuccess(
          `La campagne a été supprimé avec succès.`
        );
      },
      error: (error: any) => {
        console.error('Erreur lors de la suppression du contact:', error);
        this.toastService.showError(
          'Erreur lors de la suppression du contact.'
        );
      },
    });
  }
}

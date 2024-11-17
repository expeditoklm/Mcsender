import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Company } from '../models/company';
import { debounceTime, Subject } from 'rxjs';
import { CompanyCreateComponent } from '../components/company-create/company-create.component';
import { CompanyDetailsModalComponent } from '../components/company-details-modal/company-details-modal.component';
import { Router } from '@angular/router';
import { DeleteModalService } from '../../../consts/components/delete-modal/delete-modal.service';
import { ToastService } from '../../../consts/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';

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
  ],
  templateUrl: './companies-page.component.html',
  styleUrl: './companies-page.component.css'
})
export class CompaniesPageComponent {

  constructor(private modalService: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private deleteModalService: DeleteModalService,
    private toastService: ToastService,
    private http: HttpClient

  ) {}

  toggleDetails(company: Company): void {
    company.deleted = !company.deleted;
  }


   companies: Company[] = [
    {
      id: 1,
      name: 'Tech Innovators',
      description: 'Entreprise spécialisée dans les solutions technologiques.',
      link_fb: 'https://facebook.com/techinnovators',
      link_tiktok: 'https://tiktok.com/@techinnovators',
      secondary_color: '#FF5733',
      primary_color: '#1D8EB8',
      tertiary_color: '#FFBD33',
      phone: '+1234567890',
      whatsapp: '+1234567890',
      location: 'New York, USA',
      link: 'https://www.techinnovators.com',
      link_insta: 'https://instagram.com/techinnovators',
      link_pinterest: 'https://pinterest.com/techinnovators',
      link_twit: 'https://twitter.com/techinnovators',
      link_youtube: 'https://youtube.com/techinnovators',
      isActive: true,
      deleted: false
    },
    {
      id: 2,
      name: 'Green Energy Solutions',
      description: 'Fournisseur d\'énergies renouvelables.',
      link_fb: 'https://facebook.com/greenenergy',
      link_tiktok: 'https://tiktok.com/@greenenergy',
      secondary_color: '#00A86B',
      primary_color: '#008080',
      tertiary_color: '#A4C639',
      phone: '+9876543210',
      whatsapp: '+9876543210',
      location: 'San Francisco, USA',
      link: 'https://www.greenenergy.com',
      link_insta: 'https://instagram.com/greenenergy',
      link_pinterest: 'https://pinterest.com/greenenergy',
      link_twit: 'https://twitter.com/greenenergy',
      link_youtube: 'https://youtube.com/greenenergy',
      isActive: false,
      deleted: false
    },
    {
      id: 3,
      name: 'Fashion Hub',
      description: 'Boutique de vêtements en ligne.',
      link_fb: 'https://facebook.com/fashionhub',
      link_tiktok: 'https://tiktok.com/@fashionhub',
      secondary_color: '#D7263D',
      primary_color: '#333333',
      tertiary_color: '#EAEAEA',
      phone: '+1122334455',
      whatsapp: '+1122334455',
      location: 'Paris, France',
      link: 'https://www.fashionhub.com',
      link_insta: 'https://instagram.com/fashionhub',
      link_pinterest: 'https://pinterest.com/fashionhub',
      link_twit: 'https://twitter.com/fashionhub',
      link_youtube: 'https://youtube.com/fashionhub',
      isActive: true,
      deleted: false
    },
    {
      id: 4,
      name: 'Digital Marketing Pro',
      description: 'Agence de marketing digital spécialisée en SEO.',
      link_fb: 'https://facebook.com/digitalmarketingpro',
      link_tiktok: 'https://tiktok.com/@digitalmarketingpro',
      secondary_color: '#FF8800',
      primary_color: '#0055AA',
      tertiary_color: '#FFFFFF',
      phone: '+9988776655',
      whatsapp: '+9988776655',
      location: 'Londres, Royaume-Uni',
      link: 'https://www.digitalmarketingpro.com',
      link_insta: 'https://instagram.com/digitalmarketingpro',
      link_pinterest: 'https://pinterest.com/digitalmarketingpro',
      link_twit: 'https://twitter.com/digitalmarketingpro',
      link_youtube: 'https://youtube.com/digitalmarketingpro',
      isActive: true,
      deleted: false
    },
    {
      id: 5,
      name: 'Startup Boosters',
      description: 'Incubateur pour startups technologiques.',
      link_fb: 'https://facebook.com/startupboosters',
      link_tiktok: 'https://tiktok.com/@startupboosters',
      secondary_color: '#FF4444',
      primary_color: '#00C851',
      tertiary_color: '#33B5E5',
      phone: '+5566778899',
      whatsapp: '+5566778899',
      location: 'Berlin, Allemagne',
      link: 'https://www.startupboosters.com',
      link_insta: 'https://instagram.com/startupboosters',
      link_pinterest: 'https://pinterest.com/startupboosters',
      link_twit: 'https://twitter.com/startupboosters',
      link_youtube: 'https://youtube.com/startupboosters',
      isActive: true,
      deleted: false
    }
  ];
  

  searchName = '';
  searchDesc = '';
  searchLocation = '';

  pageIndex = 1;
  pageSize = 5;
  total = this.companies.length;
  isModalVisible = false;
  valide = true;
  nonValide = false;
 

  private searchSubject: Subject<void> = new Subject();
  ngOnInit() {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      this.applyFilter();
    });
    this.applyFilter();
  }


  applyFilter(): void {
    const isNotInCompanyRoute = this.router.url.includes('/dashboard/companies-not-confirm');
    const isInCompanyRoute = this.router.url.includes('/dashboard/companies');

    if (isNotInCompanyRoute) {
      // Filtrer uniquement les utilisateurs qui ne sont pas dans l'entreprise
      this.companies = this.companies.filter(company => company.isActive == false);
    } else if (isInCompanyRoute) {
      // Filtrer uniquement les utilisateurs qui sont dans l'entreprise
      this.companies = this.companies.filter(company => company.isActive === true);
    }

    this.total = this.companies.length;
  }
  // Fonction de filtrage des utilisateurs
  get filteredCompanies(): Company[] {
    const filtered = this.companies.filter(company =>
      company.name.toLowerCase().includes(this.searchName.toLowerCase()) &&
      company.description.toLowerCase().includes(this.searchDesc.toLowerCase()) &&
      company.location.toLowerCase().includes(this.searchLocation.toLowerCase())
    );

    this.total = filtered.length;
    const start = (this.pageIndex - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
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
// fonction pour creer un company
  openCompanyCreateModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: 'Créer un utilisateur',
      nzContent: CompanyCreateComponent,
      nzFooter: null,
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
// fonction pour voir un company
  viewDetailsCompany(company: any): void {
    this.modalService.create({
      nzTitle: 'Détails de l\'utilisateur',
      nzContent: CompanyDetailsModalComponent,
      nzData: { company },
      nzFooter: null
    });
  }
// fonction pour la modification
  editCompany(company: any): void {
    console.log('Modifier l\'utilisateur:', company);
    // Ajouter votre logique pour modifier l'utilisateur
  }


  stepsConfig = [
    {
      title: 'Info Base',
      controls: [
        { name: 'name', placeholder: 'Nom de la société', validators: [Validators.required] },
        { name: 'description', placeholder: 'Description', validators: [Validators.required] },
        { name: 'phone', placeholder: 'Téléphone', validators: [Validators.required] },
        { name: 'whatsapp', placeholder: 'WhatsApp', validators: [Validators.required] },
        { name: 'location', placeholder: 'Localisation', validators: [Validators.required] }
      ]
    },
    {
      title: 'Liens ',
      controls: [
        { name: 'link_fb', placeholder: 'Lien Facebook', validators: [] },
        { name: 'link_tiktok', placeholder: 'Lien TikTok', validators: [] },
        { name: 'link_insta', placeholder: 'Lien Instagram', validators: [] },
        { name: 'link_pinterest', placeholder: 'Lien Pinterest', validators: [] },
        { name: 'link_twit', placeholder: 'Lien Twitter', validators: [] },
        { name: 'link_youtube', placeholder: 'Lien YouTube', validators: [] },
        { name: 'link', placeholder: 'Site Web', validators: [Validators.required] }
      ]
    },
    {
      title: 'Couleurs ',
      controls: [
        { name: 'primary_color', placeholder: 'Couleur principale', validators: [Validators.required] },
        { name: 'secondary_color', placeholder: 'Couleur secondaire', validators: [] },
        { name: 'tertiary_color', placeholder: 'Couleur tertiaire', validators: [] }
      ]
    },
    {
      title: 'Statut',
      controls: [
        { name: 'isActive', placeholder: 'Actif', validators: [Validators.required] },
        { name: 'deleted', placeholder: 'Supprimé', validators: [] }
      ]
    }
  ];



  // Ouvrir le modal avec des données spécifiques
  openDeleteModal(company : any) {
    const modalData = {
      title: 'Supprimer cette entreprise ?',
      message: 'Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      callback: () => this.handleDelete(company.id),
    };

    this.deleteModalService.openModal(modalData); // Ouvrir le modal via le service
  }


  handleDelete(companyId: number): void {
    //Logique de suppression via l'API

    this.http.delete(`https://api.example.com/companies/${companyId}`).subscribe({
      next: () => {
        console.log('Compagnie supprimée avec succès');
        this.companies = this.companies.filter(company => company.id !== companyId);
        let msg='La compagnie spprimer avec succes n0 :'
        this.toastService.showSuccess(msg + companyId);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression de la compagnie', err);
        this.toastService.showError('Erreur lors de la suppression de la compagnie.');
      },
    });
  }



  
















  
}


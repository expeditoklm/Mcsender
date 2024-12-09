import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { Company } from '../../models/company';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../../../consts/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-company-details-modal',
  standalone: true,
  imports: [CommonModule, NzModalModule, NzButtonModule, NzIconModule,NzTabsModule
  ],
  templateUrl: './company-details-modal.component.html',
  styleUrl: './company-details-modal.component.css'
})
export class CompanyDetailsModalComponent  implements OnInit {
  @Inject(NZ_MODAL_DATA) public data: any

  company: Company;
  isLoading = false;
  isError = false;

  constructor(
    private modalRef: NzModalRef,
    private toastService: ToastService,
    private companyService: CompanyService,
    private queryClient: QueryClient
  ) {
    // Initialiser la variable company avec les données reçues
    console.log('Données reçues dans le modal :', this.data);
    this.company = this.data?.company || {};  // S'assurer que company est défini, même s'il est vide
    console.log('maintenant :', this.company);

  }
  ngOnInit(): void {
    setTimeout(() => {
      this.loadCompany();
    }, 500); 
  }

  loadCompany() {
    this.isLoading = true;
    const queryObserver = new QueryObserver<any>(this.queryClient, {
      queryKey: ['companyData'],
      queryFn: async () => {
        return await firstValueFrom(this.companyService.getCompanyById( this.data?.id ));
      },
    });

    queryObserver.subscribe((result) => {
      if (result.status === 'success' && result.data?.company) {
        console.log("donnée  retourner par api : ",result)
        // Traitement des données en cas de succès
        this.company = result.data.company;
        this.isError = false;
        this.isLoading = false;
    
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

  closeModal(): void {
    this.modalRef.destroy();
  }
}
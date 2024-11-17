import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
  selector: 'app-company-details-modal',
  standalone: true,
  imports: [CommonModule, NzModalModule, NzButtonModule, NzIconModule,NzTabsModule
  ],
  templateUrl: './company-details-modal.component.html',
  styleUrl: './company-details-modal.component.css'
})
export class CompanyDetailsModalComponent {

  company: any; // Définir la variable company

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: any
  ) {
    // Initialiser la variable company avec les données reçues
    console.log('Données reçues dans le modal :', data);
    this.company = data?.company || {};  // S'assurer que company est défini, même s'il est vide
    console.log('maintenant :', this.company);

  }

  closeModal(): void {
    this.modalRef.destroy();
  }
}
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { Component, Inject } from '@angular/core';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-user-details-modal',
  standalone: true,
  templateUrl: './user-details-modal.component.html',
  styleUrls: ['./user-details-modal.component.css'],
  imports: [CommonModule, NzModalModule, NzButtonModule, NzIconModule,NzTabsModule
  ]
})
//{ id: 3, name: '63.ael Johnson', email: 'michael@example.com', role: 'Moderator', phone: '987-654', address: '789 Oak St', company: 'Company C', createdAt: '2023-01-03', status: 'Active', detailsVisible: false },

export class UserDetailsModalComponent {
  user: any; // Définir la variable user

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: any
  ) {
    // Initialiser la variable user avec les données reçues
    console.log('Données reçues dans le modal :', data);
    this.user = data?.user || {};  // S'assurer que user est défini, même s'il est vide
    console.log('maintenant :', this.user);

  }

  closeModal(): void {
    this.modalRef.destroy();
  }
}
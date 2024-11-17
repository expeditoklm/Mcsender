// modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeleteModalService {
  private modalState = new BehaviorSubject<boolean>(false);
  private modalData = new BehaviorSubject<any>(null);

  // Observable pour la visibilité du modal
  modalState$ = this.modalState.asObservable();

  // Méthodes pour contrôler l'état du modal
  openModal(data: any) {
    this.modalData.next(data); // Passer les données du modal
    this.modalState.next(true);
  }

  closeModal() {
    this.modalState.next(false);
  }

  // Récupérer les données du modal
  getModalData() {
    return this.modalData.asObservable();
  }
}

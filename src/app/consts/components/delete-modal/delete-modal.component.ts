import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DeleteModalService } from './delete-modal.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css'
})
export class DeleteModalComponent implements OnInit {
  isVisible: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  confirmText: string = '';
  cancelText: string = '';


  private modalSubscription!: Subscription;
  private callbackFunction!: () => void;

  constructor(private modalService: DeleteModalService) {}

  ngOnInit(): void {
    // S'abonner à l'état du modal
    this.modalSubscription = this.modalService.modalState$.subscribe(state => {
      this.isVisible = state;
      if (this.isVisible) {
        // Charger les données du modal
        this.modalService.getModalData().subscribe(data => {
          this.modalTitle = data?.title || '';
          this.modalMessage = data?.message || '';
          this.confirmText = data?.confirmText || 'Confirm';
          this.cancelText = data?.cancelText || 'Cancel';
          this.callbackFunction = data?.callback || (() => {});
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites de mémoire
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
  }

  closeModal(): void {
    this.modalService.closeModal(); // Fermer le modal via le service
  }

  handleDelete(): void {
    // Exécuter la fonction de callback
    if (this.callbackFunction) {
      this.callbackFunction();
    }
    this.closeModal();
  }
}

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
import { Router, RouterModule } from '@angular/router';
import { TemplateTypeService } from '../services/template-type.service';
import { DeleteModalService } from '../../../consts/components/delete-modal/delete-modal.service';
import { ToastService } from '../../../consts/components/toast/toast.service';
import { CreateTemplateType } from '../models/CreateTemplateType';
import { templateTypeCreateComponent } from '../components/template-type-create/template-type-create.component';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { ChannelService } from '../../channels/services/channel.service';

@Component({
  selector: 'app-templates-types-page',
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
  templateUrl: './templates-types-page.component.html',
  styleUrls: ['./templates-types-page.component.css'],
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class TemplatesTypesPageComponent implements OnInit {

  templateTypes: CreateTemplateType[] = [];
  filteredTemplateTypes: CreateTemplateType[] = [];
  
  isLoading = false;
  isError = false;

  searchLabel = '';
  searchChannel = '';
  pageIndex = 1;
  pageSize = 5;
  total = this.templateTypes.length;
  isModalVisible = false;
  private searchSubject: Subject<void> = new Subject();

  constructor(
    private modalService: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private deleteModalService: DeleteModalService,
    private toastService: ToastService,
    private queryClient: QueryClient,
    private channelService: ChannelService,
    private templateTypeService: TemplateTypeService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loadTemplateTypes();
    }, 500); // Délai en millisecondes

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      this.filterTemplateTypes();
    });
  }


  loadTemplateTypes() {
    this.isLoading = true;
    const queryObserver = new QueryObserver<any>(this.queryClient, {
      queryKey: ['templateTypesList'],
      queryFn: async () => {
        return await firstValueFrom(this.templateTypeService.getAllTemplateTypes());
      },
    });

    queryObserver.subscribe((result) => {
      if (result.error) {
        this.isError = true;
        console.error('Erreur lors du chargement des types de template:', result.error);
        this.toastService.showError('Erreur lors du chargement des types de template.');
      } else {
        this.templateTypes = result.data || [];
        this.filterTemplateTypes();
        this.isError = false;
        this.isLoading = result.isFetching;
      }
    });
  }

  filterTemplateTypes(): void {
    let filtered = [...this.templateTypes];

    // Fonction asynchrone pour récupérer le nom de la compagnie
    const fetchChannelName = async (channelId: number): Promise<string> => {
      try {
        const channel : any = await firstValueFrom(
          this.channelService.getChannelById(channelId)
        );
        return channel.channel?.label || '';
      } catch (error) {
        
        console.error(
          `Erreur lors de la récupération de la compagnie avec ID ${channelId}`,
          error
        );
        return '';
      }
    };

    // Appliquer les filtres
    const filterAsync = async () => {
      const promises = filtered.map(async (templateType) => {
        const channelLib = await fetchChannelName(templateType.channel_id);

        const label = templateType.label?.toLowerCase() || '';

        const matchesFilters =
        label.includes(this.searchLabel.toLowerCase()) &&
        channelLib.toLowerCase().includes(this.searchChannel.toLowerCase()) 

        if (matchesFilters) {
          return { ...templateType, channelLib }; // Ajoutez le nom de la compagnie
        }

        return null;
      });

      const filteredResults = await Promise.all(promises);
      const finalFiltered = filteredResults.filter((result) => result !== null);

      this.total = finalFiltered.length;

      const start = (this.pageIndex - 1) * this.pageSize;
      this.filteredTemplateTypes = finalFiltered.slice(
        start,
        start + this.pageSize
      );
      this.cdr.detectChanges(); // Nécessaire pour forcer Angular à re-rendre la vue
    };

    filterAsync().catch((error) =>
      console.error('Erreur lors du filtrage des campagnes :', error)
    );
  }

 
  
  onSearchChange(): void {
    this.searchSubject.next();
  }

  // Pagination
  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.filterTemplateTypes();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.filterTemplateTypes();
  }

  openTemplateTypeCreateModal(templateTypeData?: CreateTemplateType): void {
    const modalRef = this.modalService.create({
      nzTitle: templateTypeData ? 'Modifier le type de modèle' : 'Créer un type de modèle',
      nzContent: templateTypeCreateComponent,
      nzFooter: null,
      nzWidth: '600px',
      nzData: {
        templateTypeData: templateTypeData,
        isEdit: !!templateTypeData,
      },
    });

    modalRef.afterClose.subscribe((templateTypeDto) => {
      if (templateTypeDto) {
        const { id, created_at, updated_at, deleted,channelLib,templates, ...filteredTemplateTypeDto } = templateTypeDto;
        const operation = id
          ? this.templateTypeService.updateTemplateType(id, filteredTemplateTypeDto)
          : this.templateTypeService.createTemplateType(filteredTemplateTypeDto);

        operation.subscribe({
          next: (templateType) => {
            if (templateTypeDto.id) {
              const index = this.templateTypes.findIndex((u) => u.id === templateType.id);
              if (index !== -1) {
                this.templateTypes[index] = templateType;
              }
              this.loadTemplateTypes();
              this.toastService.showSuccess('Type de modèle mis à jour avec succès.');
            } else {
              this.loadTemplateTypes();
              this.toastService.showSuccess('Type de modèle créé avec succès.');
            }
            this.filterTemplateTypes();
          },
          error: (e: any) => {
            console.error("Erreur lors de l'opération type de modèle :", e.error.message);
            this.toastService.showError(e.error.message);
          },
        });
      }
    });
  }

  openDeleteModal(templateType: any): void {
    if (!templateType.id) {
      this.toastService.showError('ID du type de modèle non valide');
      return;
    }

    const modalData = {
      title: 'Supprimer ce type de modèle ?',
      message: 'Êtes-vous sûr de vouloir supprimer ce type de modèle ? Cette action est irréversible.',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      callback: () => this.handleDelete(templateType.id), // Le '!' indique que nous sommes sûrs que l'id existe
    };

    this.deleteModalService.openModal(modalData);
  }

  handleDelete(templateTypeId: number): void {
    this.templateTypeService.deleteTemplateType(templateTypeId).subscribe({
      next: () => {
        this.templateTypes = this.templateTypes.filter((templateType) => templateType.id !== templateTypeId);
        this.filterTemplateTypes();
        this.toastService.showSuccess('Le type de modèle a été supprimé avec succès.');
      },
      error: (error) => {
        console.error("Erreur lors de la suppression du type de modèle :", error);
        this.toastService.showError("Erreur lors de la suppression du type de modèle");
      },
    });
  }
}

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
import { TemplateService } from '../services/template.service';
import { DeleteModalService } from '../../../consts/components/delete-modal/delete-modal.service';
import { ToastService } from '../../../consts/components/toast/toast.service';
import { CreateTemplate } from '../models/CreateTemplate';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { TemplateTypeService } from '../../template-types/services/template-type.service';
import { templateCreateComponent } from '../components/template-create/template-create.component';

@Component({
  selector: 'app-templates-page',
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
  templateUrl: './templates-page.component.html',
  styleUrls: ['./templates-page.component.css'],
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class TemplatesPageComponent implements OnInit {
  templates: CreateTemplate[] = [];
  filteredTemplates: CreateTemplate[] = [];

  isLoading = false;
  isError = false;

  searchName = '';
  searchTemplateType = '';
  pageIndex = 1;
  pageSize = 5;
  total = this.templates.length;
  private searchSubject: Subject<void> = new Subject();

  constructor(
    private modalService: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private deleteModalService: DeleteModalService,
    private toastService: ToastService,
    private queryClient: QueryClient,
    private templateTypeService: TemplateTypeService,

    private templateService: TemplateService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loadTemplates();
    }, 500);

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      this.filterTemplates();
    });
  }

  loadTemplates(): void {
    this.isLoading = true;
    const queryObserver = new QueryObserver<any>(this.queryClient, {
      queryKey: ['templatesList'],
      queryFn: async () => {
        return await firstValueFrom(this.templateService.getAllTemplates());
      },
    });

    queryObserver.subscribe((result) => {
      if (result.error) {
        this.isError = true;
        console.error('Erreur lors du chargement des templates:', result.error);
        this.toastService.showError('Erreur lors du chargement des templates.');
      } else {
        this.templates = result.data || [];
        this.filterTemplates();
        this.isError = false;
        this.isLoading = result.isFetching;
      }
    });
  }

  filterTemplates(): void {
    let filtered = [...this.templates];

    // Fonction asynchrone pour récupérer le nom de la compagnie
    const fetchTemplateTypeName = async (templateTypeId: number): Promise<string> => {
      try {
        const templateType : any = await firstValueFrom(
          this.templateTypeService.getTemplateTypeById(templateTypeId)
        );
        return templateType?.label || '';
      } catch (error) {
        
        console.error(
          `Erreur lors de la récupération de la compagnie avec ID ${templateTypeId}`,
          error
        );
        return '';
      }
    };

    // Appliquer les filtres
    const filterAsync = async () => {
      const promises = filtered.map(async (template) => {
        const templateTypeLib = await fetchTemplateTypeName(template.template_type_id);

        const name = template.name?.toLowerCase() || '';
        const content = template.content?.toLowerCase() || '';

        const matchesFilters =
        name.includes(this.searchName.toLowerCase()) &&
        templateTypeLib.toLowerCase().includes(this.searchTemplateType.toLowerCase()) 

        if (matchesFilters) {
          return { ...template, templateTypeLib }; // Ajoutez le nom de la compagnie
        }

        return null;
      });

      const filteredResults = await Promise.all(promises);
      const finalFiltered = filteredResults.filter((result) => result !== null);

      this.total = finalFiltered.length;

      const start = (this.pageIndex - 1) * this.pageSize;
      this.filteredTemplates = finalFiltered.slice(
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

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.filterTemplates();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.filterTemplates();
  }

  openTemplateCreateModal(templateData?: CreateTemplate): void {
    const modalRef = this.modalService.create({
      nzTitle: templateData ? 'Modifier le template' : 'Créer un template',
      nzContent: templateCreateComponent, // Remplacez par le composant réel pour créer/éditer
      nzFooter: null,
      nzWidth: '600px',
      nzData: {
        templateData: templateData,
        isEdit: !!templateData,
      },
    });

    modalRef.afterClose.subscribe((templateDto) => {
      if (templateDto) {
        const { id, created_at, updated_at, deleted,templateTypeLib,templates,templateType, ...filteredTemplateDto } = templateDto;

        const operation = id
          ? this.templateService.updateTemplate(id, filteredTemplateDto)
          : this.templateService.createTemplate(filteredTemplateDto);

        operation.subscribe({
          next: () => {
            this.loadTemplates();
            this.toastService.showSuccess(
              templateDto.id
                ? 'Template mis à jour avec succès.'
                : 'Template créé avec succès.'
            );
          },
          error: (e: any) => {
            console.error('Erreur lors de l\'opération sur le template :', e);
            this.toastService.showError('Erreur lors de l\'opération.');
          },
        });
      }
    });
  }

  openDeleteModal(template: any): void {
    if (!template.id) {
      this.toastService.showError('ID du template non valide');
      return;
    }

    const modalData = {
      title: 'Supprimer ce template ?',
      message: 'Êtes-vous sûr de vouloir supprimer ce template ? Cette action est irréversible.',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      callback: () => this.handleDelete(template.id),
    };

    this.deleteModalService.openModal(modalData);
  }

  handleDelete(templateId: number): void {
    this.templateService.deleteTemplate(templateId).subscribe({
      next: () => {
        this.templates = this.templates.filter((template) => template.id !== templateId);
        this.filterTemplates();
        this.toastService.showSuccess('Template supprimé avec succès.');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du template :', error);
        this.toastService.showError('Erreur lors de la suppression.');
      },
    });
  }
}

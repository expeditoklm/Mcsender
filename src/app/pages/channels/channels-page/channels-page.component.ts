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
import { UserCreateComponent } from '../../users/components/user-create/user-create.component';
import { DeleteModalService } from '../../../consts/components/delete-modal/delete-modal.service';
import { ToastService } from '../../../consts/components/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { Channel } from '../models/Channel';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { ChannelCreateComponent } from '../components/channel-create/channel-create.component';
import { ChannelService } from '../services/channel.service';

@Component({
  selector: 'app-channels-page',
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
  templateUrl: './channels-page.component.html',
  styleUrl: './channels-page.component.css',
  providers: [
    {
      provide: QueryClient,
      useFactory: () => new QueryClient(),
    },
  ],
})
export class ChannelsPageComponent implements OnInit {

   channels: Channel[] = [];
    filteredChannels: Channel[] = [];
    isLoading = false;
    isError = false;


  constructor(
    private modalService: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private deleteModalService: DeleteModalService,
    private toastService: ToastService,
    private http: HttpClient,
    private queryClient: QueryClient,
        private channelService: ChannelService,
    
  ) {}



  searchLabel = '';


  pageIndex = 1;
  pageSize = 5;
  total = this.channels.length;
  isModalVisible = false;
  private searchSubject: Subject<void> = new Subject();

  ngOnInit() {
    setTimeout(() => {
      this.loadChannels();
    }, 500); // Délai en millisecondesbv

    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 1;
      this.filterChannels();
    });
  }

  loadChannels() {
    this.isLoading = true;
    const queryObserver = new QueryObserver<any>(this.queryClient, {
      queryKey: ['channelsList'],
      queryFn: async () => {
        return await firstValueFrom(this.channelService.getAllChannels());
      },
    });

    queryObserver.subscribe((result) => {
      if (result.error) {
        this.isError = true;
        console.error('Erreur lors du chargement des canaux:', result.error);
        this.toastService.showError('Erreur lors du chargement des canaux.');
      } else {
        if (
          result.data &&
          Array.isArray(result.data)
        ) {
          // Si result.data.audiences est défini et est un tableau
          this.channels = result.data;
          this.filterChannels(); // Appliquez un filtrage ou une logique additionnelle si nécessaire
        } else {
          // Si result.data.audiences est indéfini ou dans un format inattendu
          console.warn('Format inattendu des données :', result.data);
          this.channels = []; // Initialisez un tableau vide pour éviter des erreurs plus loin
        }

        this.isError = false;
        this.isLoading = false; // Assurez-vous de stopper le chargement
      }
    });
  }


  filterChannels(): void {
    let filtered = [...this.channels];
  
    // Appliquer les filtres
    filtered = filtered.filter((channel: any) => {
      const libelle = channel.label?.toLowerCase() || '';
      // Comparaison pour voir si le label du canal contient le terme de recherche
      return libelle.includes(this.searchLabel.toLowerCase());
    });
  
    // Mise à jour du nombre total de résultats filtrés
    this.total = filtered.length;
  
    // Calcul des éléments à afficher selon la pagination
    const start = (this.pageIndex - 1) * this.pageSize;
    this.filteredChannels = filtered.slice(start, start + this.pageSize);
  
    this.cdr.detectChanges(); // Nécessaire pour forcer Angular à re-rendre la vue
  }
  
  // Fonction de recherche
   onSearchChange(): void {
    this.searchSubject.next();
  }

  // Pagination
  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.filterChannels();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.filterChannels();
  }

   openChannelCreateModal(channelData?: any): void {
      const modalRef = this.modalService.create({
        nzTitle: channelData? 'Modifier le canal':  'Créer un canal' ,
        nzContent: ChannelCreateComponent,
        nzFooter: null,
        nzWidth: '600px',
        nzData: {
          channelData: channelData,
           isEdit: !!channelData,
        },  
      });
      modalRef.afterClose.subscribe((channelDto) => {
        if (channelDto) {
          console.log(channelDto)
          const {
            id,
            created_at,
            updated_at,
            deleted,
            ...filteredchannelDto
          } = channelDto;
       
          const operation =  id ? this.channelService.updateChannel(id, filteredchannelDto)
          :this.channelService.createChannel(filteredchannelDto);
  
          operation.subscribe({
            next: (channel) => {
              if (channelDto.id) {
                const index = this.channels.findIndex(
                  (u) => u.id === channel.id
                );
                if (index !== -1) {
                  this.channels[index] = channel;
                }
                this.loadChannels();
                this.toastService.showSuccess(
                  'Canal mise à jour avec succès.'
                );
              }  else {
              this.loadChannels();
              this.toastService.showSuccess('Canal créé avec succès.');
            }
            this.filterChannels();
            },
            error: (e: any) => {
              console.error(
                "Erreur lors de l'opération campagne :",
                e.error.message
              );
              this.toastService.showError(e.error.message);
            },
          });
        }
      });
    }
  
  
    openDeleteModal(channel: any) {
      if (!channel.id) {
        this.toastService.showError('ID de la campagne non valide');
        return;
      }
  
      const modalData = {
        title: 'Supprimer ce canal ?',
        message:
          'Êtes-vous sûr de vouloir supprimer ce canal ? Cette action est irréversible.',
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        callback: () => this.handleDelete(channel.id!), // Le '!' indique que nous sommes sûrs que l'id existe
      };
  
      this.deleteModalService.openModal(modalData);
    }
  
    handleDelete(channelId: number): void {
      this.channelService.removeChannel(channelId).subscribe({
        next: () => {
          this.channels = this.channels.filter((channel) => channel.id !== channelId);
          this.filterChannels();
          this.toastService.showSuccess(
            `Le canal a été supprimé avec succès.`
          );
        },
        error: (error) => {
          console.error("Erreur lors de la suppression du canal :", error);
          this.toastService.showError(
            "Erreur lors de la suppression du canal "
          );
        },
      });
    }
 

  
}

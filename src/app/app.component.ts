import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Import des modules NG-Zorro
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';  // Importation des icônes
import { NZ_ICONS } from 'ng-zorro-antd/icon'; // Importation des icônes
import { UserOutline, TeamOutline } from '@ant-design/icons-angular/icons';  // Icônes spécifiques
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

// Importation des modules de @ngneat/query
import {  QueryClient } from '@ngneat/query';
import { DeleteModalComponent } from './consts/components/delete-modal/delete-modal.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzTableModule,
    NzFormModule,
    NzButtonModule,
    NzIconModule, 
    NzDropDownModule,
    DeleteModalComponent
  ],
  providers: [
    { 
      provide: NZ_ICONS,  // Déclaration des icônes que vous souhaitez utiliser
      useValue: [UserOutline, TeamOutline],  // Liste des icônes à inclure
    },
    {
      provide: QueryClient,  // Fournir QueryClient pour toute l'application
      useFactory: () => new QueryClient(),
    },
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mcsender';
}

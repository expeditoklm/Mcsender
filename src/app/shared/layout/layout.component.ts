

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';

// Import NG-Zorro modules
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import {
  UserOutline,
  TeamOutline,
  PieChartOutline,
  UnorderedListOutline,
  UserDeleteOutline,
  BankOutline,
  WarningOutline,
  ProjectOutline,
  ClusterOutline,
  FileTextOutline,
  FileOutline,
  MessageOutline,
} from '@ant-design/icons-angular/icons';
import { NzDropdownMenuComponent, NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../pages/login/services/login.service';



@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzButtonModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzDropDownModule,
    RouterModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})


export class LayoutComponent implements OnInit  {
  title: string = '';
  userEmail: string | null = null;
  userName: string | null = null;

  constructor(
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loginService: LoginService
  ) 
  {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd
      ),
        map(() => {
          let child = this.activatedRoute.firstChild;
          while (child?.firstChild) {
            child = child.firstChild;
          }
          return child?.snapshot.data['title'] || '';
        })
      )
      .subscribe((pageTitle) => {
        this.title = pageTitle;
        this.titleService.setTitle(pageTitle);
      });
  }
  

  ngOnInit(): void {
    this.getUserEmail();
  }

  getUserEmail(): void {
    const token = sessionStorage.getItem("user_session_token");
    this.userName = sessionStorage.getItem("user_session_username");
    if (token) {
      const decodedToken = this.loginService.decodeJWT(token);
      const id = decodedToken?.id || null;
      this.userEmail = decodedToken?.email || null;
    }
  }

  dropdownVisible: boolean = false;

  toggleDropdown(event: MouseEvent): void {
    this.dropdownVisible = !this.dropdownVisible;
    setTimeout(() => {
      document.addEventListener('click', (e: MouseEvent) => {
        // Cast explicite de event.target en Element
        if (!(e.target as Element).closest('.profile-container')) {
          this.dropdownVisible = false;
        }
      });
    }, 10);
  }
  

  logout(): void {
    sessionStorage.removeItem("user_session_token");
    sessionStorage.removeItem("user_session_username");
    this.router.navigate(['/login']);
    location.reload();
    // Logique de déconnexion
    console.log('Déconnexion');
  }
}





import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page/dashboard-page.component';
import { UsersComponent } from './users/users.component';
import { UsersPageComponent } from './pages/users/users-page/users-page.component';
import { CompaniesPageComponent } from './pages/companies/companies-page/companies-page.component';
import { AudiencesPageComponent } from './pages/audiences/audiences-page/audiences-page.component';
import { MessagesPageComponent } from './pages/messages/messages-page/messages-page.component';
import { CampaignsPageComponent } from './pages/campaigns/campaigns-page/campaigns-page.component';
import { TemplatesPageComponent } from './pages/templates/templates-page/templates-page.component';
import { ChannelsPageComponent } from './pages/channels/channels-page/channels-page.component';
import { TemplatesTypesPageComponent } from './pages/template-types/templates-types-page/templates-types-page.component';
import { ContactsPageComponent } from './pages/contacts/contacts-page/contacts-page.component';
import { LoginPageComponent } from './pages/login/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register/register-page/register-page.component';
import { ForgotPasswordPageComponent } from './pages/forgot-password/forgot-password-page/forgot-password-page.component';

export const routes: Routes = [

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component:  LoginPageComponent },
    { path: 'register', component:  RegisterPageComponent },
    { path: 'forgot-password', component:  ForgotPasswordPageComponent },
    
    {
        path: 'dashboard',
        component: LayoutComponent,
        canActivate: [],
        children: [
          { path: '', redirectTo: '', pathMatch: 'full' },
          { path: '', component: DashboardPageComponent  , data: { title: 'Tableau de bord' } },
          { path: 'users', component: UsersPageComponent , data: { title: 'Utilisateurs' } },
          { path: 'users-not-in-company', component: UsersPageComponent , data: { title: 'Utilisateurs sans entreprise' } },
          { path: 'companies', component: CompaniesPageComponent , data: { title: 'Compagnies' } },
          { path: 'companies-not-confirm', component: CompaniesPageComponent , data: { title: 'Compagnies non comfirmées' } },
          { path: 'compaigns', component: CampaignsPageComponent , data: { title: 'Compagnes' } },
          { path: 'audiences', component: AudiencesPageComponent , data: { title: 'Audiences' } },
          { path: 'channels', component: ChannelsPageComponent , data: { title: 'Canaux' } },
          { path: 'template-types', component: TemplatesTypesPageComponent , data: { title: 'Types Templates' } },
          { path: 'templates', component: TemplatesPageComponent , data: { title: 'Templates' } },
          { path: 'messages', component: MessagesPageComponent , data: { title: 'Messages' } },
          { path: 'contacts', component: ContactsPageComponent , data: { title: 'Contacts' } },
          
          { path: 'user', component:  UsersComponent, data: { title: 'Home Page' } },
        ],
      },
      { path: '**', redirectTo: 'login' }, // Gestion des routes inconnues
    ];
    
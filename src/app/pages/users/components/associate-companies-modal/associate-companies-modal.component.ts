import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, NgModule, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzListComponent, NzListItemComponent } from 'ng-zorro-antd/list';
import { NZ_MODAL_DATA, NzModalComponent, NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-associate-companies-modal',
  standalone: true,
  imports: [
    CommonModule,
    NzModalComponent,
    NzInputGroupComponent,
    NzListComponent,
    FormsModule,
    ReactiveFormsModule,
    NzListItemComponent
    
  ],
  templateUrl: './associate-companies-modal.component.html',
  styleUrl: './associate-companies-modal.component.css'
})


export class AssociateCompaniesModalComponent implements OnInit {
  @Input() user: any; // Utilisation de l'Input decorator
  @Output() companiesSelected = new EventEmitter<{ user: any, selectedCompanies: any[] }>();

  searchQuery: string = '';
  companies: any[] = [];
  filteredCompanies: any[] = [];
  selectedCompanies: any[] = [];

  constructor(private modal: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // Récupérer les données passées via 'nzData'
    this.user = this.data.user;

    this.companies = [
      { id: 1, name: 'Entreprise 1' },
      { id: 2, name: 'Entreprise 2' },
      { id: 3, name: 'Entreprise 3' },
      { id: 4, name: 'Entreprise 4' },
    ];
    this.filteredCompanies = [...this.companies];


  }

  searchCompanies() {
    if (this.searchQuery) {
      this.filteredCompanies = this.companies.filter((company) =>
        company.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredCompanies = [...this.companies];
    }
  }

  toggleCompanySelection(company: any) {
    const index = this.selectedCompanies.findIndex(c => c.id === company.id);
    if (index === -1) {
      this.selectedCompanies.push(company);
    } else {
      this.selectedCompanies.splice(index, 1);
    }
  }

  isSelected(company: any): boolean {
    return this.selectedCompanies.some(c => c.id === company.id);
  }

  removeCompany(company: any) {
    this.selectedCompanies = this.selectedCompanies.filter(c => c.id !== company.id);
  }

  submit() {
    this.companiesSelected.emit({
      user: this.user,
      selectedCompanies: this.selectedCompanies,
    });
    console.log('USER :', this.user);
    console.log('Entreprises sélectionnées :', this.selectedCompanies);
    this.modal.close();
  }

  cancel() {
    this.modal.close();
  }
}
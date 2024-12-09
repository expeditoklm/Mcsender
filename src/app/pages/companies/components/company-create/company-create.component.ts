import { Component, Inject, Input, OnInit } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import {  NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { Company } from '../../models/company';


@Component({
  selector: 'app-company-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzInputModule,
    NzStepsModule,
    NzGridModule, 
  ],
  templateUrl: './company-create.component.html',
  styleUrl: './company-create.component.css'
})
export class CompanyCreateComponent  implements OnInit {

  currentStep = 0;
  companyForm!: FormGroup;

  // Configuration des étapes
  stepsConfig = [
    {
      title: 'Info Base',
      controls: [
        { name: 'name', placeholder: 'Nom de la société', validators: [Validators.nullValidator] },
        { name: 'description', placeholder: 'Description', validators: [Validators.nullValidator] },
        { name: 'phone', placeholder: 'Téléphone', validators: [Validators.nullValidator] },
        { name: 'whatsapp', placeholder: 'WhatsApp', validators: [Validators.nullValidator] },
        { name: 'location', placeholder: 'Localisation', validators: [Validators.nullValidator] }
      ]
    },
    {
      title: 'Liens ',
      controls: [
        { name: 'link_fb', placeholder: 'Lien Facebook', validators: [] },
        { name: 'link_tiktok', placeholder: 'Lien TikTok', validators: [] },
        { name: 'link_insta', placeholder: 'Lien Instagram', validators: [] },
        { name: 'link_pinterest', placeholder: 'Lien Pinterest', validators: [] },
        { name: 'link_twit', placeholder: 'Lien Twitter', validators: [] },
        { name: 'link_youtube', placeholder: 'Lien YouTube', validators: [] },
        { name: 'link', placeholder: 'Site Web', validators: [Validators.nullValidator] }
      ]
    },
    {
      title: 'Couleurs ',
      controls: [
        { name: 'primary_color', placeholder: 'Couleur principale', validators: [Validators.nullValidator] },
        { name: 'secondary_color', placeholder: 'Couleur secondaire', validators: [] },
        { name: 'tertiary_color', placeholder: 'Couleur tertiaire', validators: [] }
      ]
    },
    {
      title: 'Statut',
      controls: [
        { name: 'isActive', placeholder: 'Actif', validators: [Validators.nullValidator] },
        { name: 'deleted', placeholder: 'Supprimé', validators: [] }
      ]
    }
  ];
 
  @Input() companyData: any; // Données initiales fournies par le parent
  //@Input() stepsConfig: any; // Données initiales fournies par le parent

  formData : Company = {
    id: undefined,
    name: "",
    description: "",
    link_fb: "",
    link_tiktok: "",
    secondary_color: "",
    primary_color: "",
    tertiary_color: "",
    phone: "",
    whatsapp: "",
    location: "",
    link: "",
    link_insta: "",
    link_pinterest: "",
    link_twit: "",
    link_youtube: "",
    isActive: true,
  };
  
  constructor(private fb: FormBuilder, private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: any
    
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.data.companyData) {
      this.formData = {
        ...this.formData,
        ...this.data.companyData,
      };
    }
     // Mettre à jour les valeurs du formulaire avec les données fournies
     this.companyForm.patchValue(this.formData);
  }

  // Méthode pour initialiser le formulaire
  initializeForm(): void {
    const formGroups = this.stepsConfig.reduce((acc, step, index) => {
      const groupControls: { [key: string]: any } = step.controls.reduce((controls: { [key: string]: any }, control) => {
        controls[control.name] = ['', control.validators];
        return controls;
      }, {});
      acc['step' + (index + 1)] = this.fb.group(groupControls);
      return acc;
    }, {} as { [key: string]: FormGroup });
  
    this.companyForm = this.fb.group(formGroups);
  }
  

  // Récupérer le FormGroup pour une étape donnée
  getFormGroup(index: number): FormGroup {
    return this.companyForm.get('step' + (index + 1)) as FormGroup;
  }

  // Récupérer les contrôles pour une étape donnée
  getFormControls(index: number): any[] {
    return this.stepsConfig[index].controls;
  }

  // Vérifier si l'étape actuelle est valide
  isCurrentStepValid(): boolean {
    return this.getFormGroup(this.currentStep).valid;
  }

  // Passer à l'étape suivante
  next(): void {
    if (this.isCurrentStepValid() && this.currentStep < this.stepsConfig.length - 1) {
      this.currentStep++;
    }
  }

  // Revenir à l'étape précédente
  prev(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  flattenFormValues(formValues: any): any {
    return Object.keys(formValues).reduce((acc, key) => {
      return { ...acc, ...formValues[key] };
    }, {});
  }
  

  // Soumettre le formulaire
  onSubmit(): void {
    if (this.companyForm.valid) {
      // Fusionner les valeurs du formulaire avec formData
      this.formData = { ...this.formData, ...this.flattenFormValues(this.companyForm.value) };
      // console.log('Formulaire validé', this.companyForm.value);
      // console.log('Données finales envoyées au parent :', this.formData);
  
      // Transmettre les données au composant parent via le modal
      this.modalRef.destroy(this.formData);
    } else {
      console.log('Formulaire invalide');
    }
  }
  

  
}
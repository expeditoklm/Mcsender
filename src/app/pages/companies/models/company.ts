import { UserCompany } from "./userCompany";

export interface Company {
    id?: number;
    name: string;
    description: string;
    link_fb: string;
    link_tiktok: string;
    secondary_color: string;
    primary_color: string;
    tertiary_color: string;
    phone: string;
    whatsapp: string;
    location: string;
    link: string;
    link_insta: string;
    link_pinterest: string;
    link_twit: string;
    link_youtube: string;
    isActive?: boolean;
    detailsVisible?: boolean;
    deleted?: boolean;
    userCompanies?: UserCompany[]; // Ajoutez cette propriété.
  }
  
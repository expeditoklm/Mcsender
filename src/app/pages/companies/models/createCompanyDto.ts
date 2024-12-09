// src/app/dto/create-company.dto.ts
export interface CreateCompanyDto {
    name: string;
    description?: string;
    link_fb?: string;
    link_tiktok?: string;
    secondary_color?: string;
    primary_color?: string;
    tertiary_color?: string;
    phone?: string;
    whatsapp?: string;
    location?: string;
    link?: string;
    link_insta?: string;
    link_pinterest?: string;
    link_twit?: string;
    link_youtube?: string;
    isActive?: boolean;
    deleted?: boolean;
  }
  
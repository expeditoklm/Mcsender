export enum CampaignStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
  }
  
  export interface CampaignDto {
    id?: number;
    name: string;
    start_date?: Date; // Facultatif
    end_date?: Date; // Facultatif
    status: CampaignStatus;
    company_id: number;
    companyLib?: string;
    deleted?: boolean;
    created_at?: boolean;
    updated_at?: boolean;

  }
  
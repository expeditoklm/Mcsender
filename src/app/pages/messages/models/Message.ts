// models/message.model.ts
export interface Message {
    id?: number;
    object?: string;
    content: string;
    status: MessageStatus;
    company_id: number;
    campaign_id: number;
    audience_id: number;
    companyLib?: string;
    scheduledDate?: Date;
  }

  export enum MessageStatus {
    SENT = 'SENT',
    PENDING = 'PENDING',
    FAILED = 'FAILED',
    SCHEDULED = 'SCHEDULED',
  }
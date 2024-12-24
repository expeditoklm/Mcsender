import { Audience } from "../../audiences/models/Audience";

export interface CreateContactDto {
    id?: number;
    name?: string;
    username?: string;
    email: string;
    phone: string;
    source?: string;
    company?: string;
    audience?: string;
    audienceContacts?: Audience[];
  }


  
import { User } from "../../users/models/user";

export interface UserCompany {
    id: number;
    user_id: number;
    company_id: number;
    isMember: boolean;
    deleted: boolean;
    created_at: string;
    updated_at: string;
    user: User;
  }
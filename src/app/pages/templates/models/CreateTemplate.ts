export interface CreateTemplate {
    id?: number;
    name?: string;
    content?: string;
    template_type_id: number;
    templateTypeLib?: string;
    deleted?: boolean;
  }
  
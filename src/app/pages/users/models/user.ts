export interface User {
    id ?: number;
    name : string;
    username : string;
    email : string;
    password ?: string;
    role    : string;
    deleted ?: boolean; // Use boolean for deleted status
    created_at ?: string;
    updated_at ?: string;
  }
  
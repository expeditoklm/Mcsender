export interface CreateUserCompanyDto {
  user_id: number;
  company_id: number;
  isMember?: boolean;
}

export interface UpdateUserCompanyDto extends Partial<CreateUserCompanyDto> { }
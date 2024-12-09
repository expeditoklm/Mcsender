// src/app/dto/update-company.dto.ts

import { CreateCompanyDto } from "./createCompanyDto";

export type UpdateCompanyDto = Partial<CreateCompanyDto>;

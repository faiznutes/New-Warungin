import { IsString, IsEmail, IsEnum, IsOptional, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(255)
  password: string;

  @IsEnum(['SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'])
  role: string;

  @IsOptional()
  @IsString()
  outletId?: string; // For staff assignment
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'])
  role?: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  outletId?: string;
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MaxLength(255)
  newPassword: string;
}

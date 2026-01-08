import { IsNotEmpty, IsEmail, IsOptional, IsInt, IsBoolean, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'nama harus diisi.' })
  name: string;

  @IsNotEmpty({ message: 'email harus diisi.' })
  @IsEmail({}, { message: 'format email tidak valid.' })
  email: string;

  @IsNotEmpty({ message: 'password harus diisi.' })
  @MinLength(6, { message: 'password minimal 6 karakter.' })
  password: string;

  @IsNotEmpty({ message: 'roleId harus diisi.' })
  @IsInt({ message: 'roleId harus berupa angka.' })
  roleId: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive harus boolean.' })
  isActive?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty({ message: 'nama harus diisi.' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'format email tidak valid.' })
  email?: string;

  @IsOptional()
  @MinLength(6, { message: 'password minimal 6 karakter.' })
  password?: string;

  @IsOptional()
  @IsInt({ message: 'roleId harus berupa angka.' })
  roleId?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive harus boolean.' })
  isActive?: boolean;
}

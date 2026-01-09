import { IsNotEmpty, IsEmail, IsOptional, IsInt, IsBoolean, MinLength, IsUUID, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'nama harus diisi.' })
  name: string;

  @IsNotEmpty({ message: 'email harus diisi.' })
  @IsEmail({}, { message: 'format email tidak valid.' })
  email: string;

  @IsNotEmpty({ message: 'password harus diisi.' })
  @MinLength(12, { message: 'password minimal 12 karakter.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password terlalu lemah. gunakan kombinasi huruf besar, huruf kecil, angka, dan karakter spesial.',
  })
  password: string;

  @IsOptional()
  @IsInt({ message: 'roleId harus berupa angka.' })
  roleId?: number;

  @IsOptional()
  @IsUUID('4', { message: 'roleUuid harus berupa UUID yang valid.' })
  roleUuid?: string;

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
  @MinLength(12, { message: 'password minimal 12 karakter.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password terlalu lemah. gunakan kombinasi huruf besar, huruf kecil, angka, dan karakter spesial.',
  })
  password?: string;

  @IsOptional()
  @IsInt({ message: 'roleId harus berupa angka.' })
  roleId?: number;

  @IsOptional()
  @IsUUID('4', { message: 'roleUuid harus berupa UUID yang valid.' })
  roleUuid?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive harus boolean.' })
  isActive?: boolean;
}

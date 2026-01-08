import { IsNotEmpty, IsOptional, IsInt, IsBoolean, IsString, IsUUID } from 'class-validator';

export class CreateMenuDto {
  @IsNotEmpty({ message: 'nama menu harus diisi.' })
  name: string;

  @IsOptional()
  path?: string;

  @IsOptional()
  icon?: string;

  @IsOptional()
  @IsString({ message: 'parentUuid harus berupa string.' })
  @IsUUID('4', { message: 'parentUuid harus berupa UUID yang valid.' })
  parentUuid?: string;

  @IsOptional()
  @IsInt({ message: 'order harus berupa angka.' })
  order?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive harus boolean.' })
  isActive?: boolean;
}

export class UpdateMenuDto {
  @IsOptional()
  @IsNotEmpty({ message: 'nama menu harus diisi.' })
  name?: string;

  @IsOptional()
  path?: string;

  @IsOptional()
  icon?: string;

  @IsOptional()
  @IsString({ message: 'parentUuid harus berupa string.' })
  parentUuid?: string | null;

  @IsOptional()
  @IsInt({ message: 'order harus berupa angka.' })
  order?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive harus boolean.' })
  isActive?: boolean;
}


import { IsNotEmpty, IsOptional, IsInt, IsBoolean, IsString, IsUUID, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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

export class ReorderMenuItemDto {
  @IsUUID('4', { message: 'uuid harus berupa UUID yang valid.' })
  uuid: string;

  @IsInt({ message: 'order harus berupa angka.' })
  order: number;

  @IsOptional()
  @IsUUID('4', { message: 'parentUuid harus berupa UUID yang valid.' })
  parentUuid?: string | null;
}

export class ReorderMenusDto {
  @IsArray({ message: 'Items harus berupa array.' })
  @ArrayMinSize(1, { message: 'Minimal harus ada 1 item untuk di-reorder.' })
  @ValidateNested({ each: true })
  @Type(() => ReorderMenuItemDto)
  items: ReorderMenuItemDto[];
}

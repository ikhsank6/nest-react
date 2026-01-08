import { IsNotEmpty, IsInt, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMenuAccessDto {
  @IsNotEmpty({ message: 'roleId harus diisi.' })
  @IsInt({ message: 'roleId harus berupa angka.' })
  roleId: number;

  @IsNotEmpty({ message: 'menuId harus diisi.' })
  @IsInt({ message: 'menuId harus berupa angka.' })
  menuId: number;

  @IsOptional()
  @IsBoolean({ message: 'canView harus boolean.' })
  canView?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'canCreate harus boolean.' })
  canCreate?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'canEdit harus boolean.' })
  canEdit?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'canDelete harus boolean.' })
  canDelete?: boolean;
}

export class UpdateMenuAccessDto {
  @IsOptional()
  @IsBoolean({ message: 'canView harus boolean.' })
  canView?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'canCreate harus boolean.' })
  canCreate?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'canEdit harus boolean.' })
  canEdit?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'canDelete harus boolean.' })
  canDelete?: boolean;
}

export class BulkMenuAccessDto {
  @IsNotEmpty({ message: 'roleId harus diisi.' })
  @IsInt({ message: 'roleId harus berupa angka.' })
  roleId: number;

  @IsArray({ message: 'menuAccess harus array.' })
  @ValidateNested({ each: true })
  @Type(() => MenuAccessItemDto)
  menuAccess: MenuAccessItemDto[];
}

export class MenuAccessItemDto {
  @IsNotEmpty({ message: 'menuId harus diisi.' })
  @IsInt({ message: 'menuId harus berupa angka.' })
  menuId: number;

  @IsOptional()
  @IsBoolean()
  canView?: boolean;

  @IsOptional()
  @IsBoolean()
  canCreate?: boolean;

  @IsOptional()
  @IsBoolean()
  canEdit?: boolean;

  @IsOptional()
  @IsBoolean()
  canDelete?: boolean;
}

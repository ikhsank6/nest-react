import { IsNotEmpty, IsInt, IsBoolean, IsOptional, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMenuAccessDto {
  @IsNotEmpty({ message: 'roleUuid harus diisi.' })
  @IsUUID('4', { message: 'roleUuid harus berupa UUID.' })
  roleUuid: string;

  @IsNotEmpty({ message: 'menuUuid harus diisi.' })
  @IsUUID('4', { message: 'menuUuid harus berupa UUID.' })
  menuUuid: string;

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
  @IsNotEmpty({ message: 'roleUuid harus diisi.' })
  @IsUUID('4', { message: 'roleUuid harus berupa UUID.' })
  roleUuid: string;

  @IsArray({ message: 'menuAccess harus array.' })
  @ValidateNested({ each: true })
  @Type(() => MenuAccessItemDto)
  menuAccess: MenuAccessItemDto[];
}

export class MenuAccessItemDto {
  @IsNotEmpty({ message: 'menuUuid harus diisi.' })
  @IsUUID('4', { message: 'menuUuid harus berupa UUID.' })
  menuUuid: string;

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

import { IsNotEmpty, IsInt, IsBoolean, IsOptional, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMenuAccessDto {
  @IsNotEmpty({ message: 'roleUuid harus diisi.' })
  @IsUUID('4', { message: 'roleUuid harus berupa UUID.' })
  roleUuid: string;

  @IsNotEmpty({ message: 'menuUuid harus diisi.' })
  @IsUUID('4', { message: 'menuUuid harus berupa UUID.' })
  menuUuid: string;
}

export class UpdateMenuAccessDto {
  @IsOptional()
  @IsNotEmpty({ message: 'menuUuid harus diisi.' })
  @IsUUID('4', { message: 'menuUuid harus berupa UUID.' })
  menuUuid?: string;
}

export class BulkMenuAccessDto {
  @IsNotEmpty({ message: 'roleUuid harus diisi.' })
  @IsUUID('4', { message: 'roleUuid harus berupa UUID.' })
  roleUuid: string;

  @IsArray({ message: 'menuUuids harus array.' })
  @IsUUID('4', { each: true, message: 'Setiap item harus berupa UUID.' })
  menuUuids: string[];
}

export class MenuAccessItemDto {
  @IsNotEmpty({ message: 'menuUuid harus diisi.' })
  @IsUUID('4', { message: 'menuUuid harus berupa UUID.' })
  menuUuid: string;
}

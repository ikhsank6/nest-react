import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'nama role harus diisi.' })
  name: string;

  @IsOptional()
  description?: string;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsNotEmpty({ message: 'nama role harus diisi.' })
  name?: string;

  @IsOptional()
  description?: string;
}

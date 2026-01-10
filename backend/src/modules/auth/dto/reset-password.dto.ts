import { IsNotEmpty, MinLength, Matches, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'uuid-token-here', description: 'Reset password token from email' })
  @IsNotEmpty({ message: 'token harus diisi.' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'StrongP@ss123!', description: 'New password (min 12 chars, must include upper, lower, number, and special char)' })
  @IsNotEmpty({ message: 'password baru harus diisi.' })
  @MinLength(12, { message: 'password minimal 12 karakter.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password terlalu lemah. gunakan kombinasi huruf besar, huruf kecil, angka, dan karakter spesial.',
  })
  password: string;
}

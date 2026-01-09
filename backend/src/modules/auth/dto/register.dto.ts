import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsNotEmpty({ message: 'nama harus diisi.' })
  name: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsNotEmpty({ message: 'email harus diisi.' })
  @IsEmail({}, { message: 'format email tidak valid.' })
  email: string;

  @ApiProperty({ example: 'StrongP@ss123!', description: 'User password (min 12 chars, must include upper, lower, number, and special char)' })
  @IsNotEmpty({ message: 'password harus diisi.' })
  @MinLength(12, { message: 'password minimal 12 karakter.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password terlalu lemah. gunakan kombinasi huruf besar, huruf kecil, angka, dan karakter spesial.',
  })
  password: string;
}


import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com', description: 'User email address' })
  @IsNotEmpty({ message: 'email harus diisi.' })
  @IsEmail({}, { message: 'format email tidak valid.' })
  email: string;

  @ApiProperty({ example: 'admin123', description: 'User password' })
  @IsNotEmpty({ message: 'password harus diisi.' })
  password: string;
}


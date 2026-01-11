import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';

const uploadPath = './uploads/images';

// Ensure upload directory exists
if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
}

@Module({
    imports: [
        MulterModule.register({
            dest: uploadPath,
        }),
    ],
    controllers: [UploadController],
})
export class UploadModule { }

import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number): Promise<{
        message: string;
        data: {
            items: any[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    findOne(uuid: string): Promise<{
        message: string;
        data: any;
    }>;
    findById(id: number): Promise<{
        message: string;
        data: any;
    }>;
    create(createUserDto: CreateUserDto): Promise<{
        message: string;
        data: any;
    }>;
    update(uuid: string, updateUserDto: UpdateUserDto): Promise<{
        message: string;
        data: any;
    }>;
    remove(uuid: string): Promise<{
        message: string;
        data: {};
    }>;
}

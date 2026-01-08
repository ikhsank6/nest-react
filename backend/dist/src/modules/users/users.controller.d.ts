import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(page?: string, limit?: string): Promise<{
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

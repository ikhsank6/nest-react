import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
export declare class MenusService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        message: string;
        data: any[];
    }>;
    findOne(uuid: string): Promise<{
        message: string;
        data: any;
    }>;
    create(createMenuDto: CreateMenuDto): Promise<{
        message: string;
        data: any;
    }>;
    update(uuid: string, updateMenuDto: UpdateMenuDto): Promise<{
        message: string;
        data: any;
    }>;
    remove(uuid: string): Promise<{
        message: string;
        data: {};
    }>;
}

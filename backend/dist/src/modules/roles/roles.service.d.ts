import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        message: string;
        data: Omit<{
            id: number;
            uuid: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        }, "id" | "deletedAt">[];
    }>;
    findOne(uuid: string): Promise<{
        message: string;
        data: any;
    }>;
    create(createRoleDto: CreateRoleDto): Promise<{
        message: string;
        data: Omit<{
            id: number;
            uuid: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        }, "id" | "deletedAt">;
    }>;
    update(uuid: string, updateRoleDto: UpdateRoleDto): Promise<{
        message: string;
        data: Omit<{
            id: number;
            uuid: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        }, "id" | "deletedAt">;
    }>;
    remove(uuid: string): Promise<{
        message: string;
        data: {};
    }>;
}

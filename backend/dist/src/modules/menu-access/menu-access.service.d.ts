import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuAccessDto, UpdateMenuAccessDto, BulkMenuAccessDto } from './dto/menu-access.dto';
export declare class MenuAccessService {
    private prisma;
    constructor(prisma: PrismaService);
    findByRole(roleId: number): Promise<{
        message: string;
        data: ({
            menu: {
                id: number;
                uuid: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isActive: boolean;
                path: string | null;
                icon: string | null;
                parentId: number | null;
                order: number;
            };
        } & {
            id: number;
            uuid: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            roleId: number;
            menuId: number;
            canView: boolean;
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
        })[];
    }>;
    getAccessibleMenus(roleId: number): Promise<{
        message: string;
        data: ({
            children: {
                id: number;
                uuid: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isActive: boolean;
                path: string | null;
                icon: string | null;
                parentId: number | null;
                order: number;
            }[];
        } & {
            id: number;
            uuid: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isActive: boolean;
            path: string | null;
            icon: string | null;
            parentId: number | null;
            order: number;
        })[];
    }>;
    create(createMenuAccessDto: CreateMenuAccessDto): Promise<{
        message: string;
        data: {
            role: {
                id: number;
                uuid: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
            menu: {
                id: number;
                uuid: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isActive: boolean;
                path: string | null;
                icon: string | null;
                parentId: number | null;
                order: number;
            };
        } & {
            id: number;
            uuid: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            roleId: number;
            menuId: number;
            canView: boolean;
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
        };
    }>;
    update(id: number, updateMenuAccessDto: UpdateMenuAccessDto): Promise<{
        message: string;
        data: {
            role: {
                id: number;
                uuid: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
            menu: {
                id: number;
                uuid: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                isActive: boolean;
                path: string | null;
                icon: string | null;
                parentId: number | null;
                order: number;
            };
        } & {
            id: number;
            uuid: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            roleId: number;
            menuId: number;
            canView: boolean;
            canCreate: boolean;
            canEdit: boolean;
            canDelete: boolean;
        };
    }>;
    bulkUpdate(bulkDto: BulkMenuAccessDto): Promise<{
        message: string;
        data: {};
    }>;
    remove(id: number): Promise<{
        message: string;
        data: {};
    }>;
}

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto, ForgotPasswordDto } from './dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        message: string;
        data: {
            accessToken: string;
            user: {
                id: number;
                email: string;
                name: string;
                role: {
                    id: number;
                    uuid: string;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                };
            };
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        message: string;
        data: {
            user: {
                id: number;
                email: string;
                name: string;
                role: {
                    id: number;
                    uuid: string;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                };
            };
        };
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
        data: {};
    }>;
    validateUser(userId: number): Promise<{
        role: {
            id: number;
            uuid: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    } & {
        id: number;
        uuid: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string;
        password: string;
        roleId: number;
        isActive: boolean;
    }>;
    getProfile(userId: number): Promise<{
        message: string;
        data: {
            id: number;
            email: string;
            name: string;
            role: {
                id: number;
                uuid: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
        };
    }>;
}

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ForgotPasswordDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<{
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

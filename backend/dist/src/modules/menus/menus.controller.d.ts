import { MenusService } from './menus.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
export declare class MenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
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

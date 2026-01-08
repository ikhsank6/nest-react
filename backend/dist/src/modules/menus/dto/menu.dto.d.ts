export declare class CreateMenuDto {
    name: string;
    path?: string;
    icon?: string;
    parentUuid?: string;
    order?: number;
    isActive?: boolean;
}
export declare class UpdateMenuDto {
    name?: string;
    path?: string;
    icon?: string;
    parentUuid?: string | null;
    order?: number;
    isActive?: boolean;
}

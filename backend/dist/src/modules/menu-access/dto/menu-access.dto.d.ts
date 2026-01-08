export declare class CreateMenuAccessDto {
    roleId: number;
    menuId: number;
    canView?: boolean;
    canCreate?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}
export declare class UpdateMenuAccessDto {
    canView?: boolean;
    canCreate?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}
export declare class BulkMenuAccessDto {
    roleId: number;
    menuAccess: MenuAccessItemDto[];
}
export declare class MenuAccessItemDto {
    menuId: number;
    canView?: boolean;
    canCreate?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}

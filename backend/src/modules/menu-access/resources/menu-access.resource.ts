export class MenuAccessResource {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  role?: {
    uuid: string;
    name: string;
  } | null;
  menu?: {
    uuid: string;
    name: string;
    path: string | null;
    icon: string | null;
    order: number;
    isActive: boolean;
  } | null;

  constructor(menuAccess: any) {
    this.uuid = menuAccess.uuid;
    this.createdAt = menuAccess.createdAt?.toISOString?.() || menuAccess.createdAt;
    this.updatedAt = menuAccess.updatedAt?.toISOString?.() || menuAccess.updatedAt;

    if (menuAccess.role) {
      this.role = {
        uuid: menuAccess.role.uuid,
        name: menuAccess.role.name,
      };
    }

    if (menuAccess.menu) {
      this.menu = {
        uuid: menuAccess.menu.uuid,
        name: menuAccess.menu.name,
        path: menuAccess.menu.path,
        icon: menuAccess.menu.icon,
        order: menuAccess.menu.order,
        isActive: menuAccess.menu.isActive,
      };
    }
  }

  static collection(menuAccessList: any[]): MenuAccessResource[] {
    return menuAccessList.map((ma) => new MenuAccessResource(ma));
  }

  toJSON() {
    const result: any = {
      uuid: this.uuid,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if (this.role !== undefined) {
      result.role = this.role;
    }

    if (this.menu !== undefined) {
      result.menu = this.menu;
    }

    return result;
  }
}

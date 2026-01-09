export class RoleResource {
  uuid: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  menuAccess?: any[];

  constructor(role: any) {
    this.uuid = role.uuid;
    this.name = role.name;
    this.description = role.description || null;
    this.createdAt = role.createdAt?.toISOString?.() || role.createdAt;
    this.updatedAt = role.updatedAt?.toISOString?.() || role.updatedAt;
    this.createdBy = role.createdBy || null;
    this.updatedBy = role.updatedBy || null;

    if (role.menuAccess) {
      this.menuAccess = role.menuAccess.map((access: any) => ({
        uuid: access.uuid,
        menu: access.menu
          ? {
              uuid: access.menu.uuid,
              name: access.menu.name,
              path: access.menu.path,
              icon: access.menu.icon,
              order: access.menu.order,
              isActive: access.menu.isActive,
            }
          : null,
      }));
    }
  }

  static collection(roles: any[]): RoleResource[] {
    return roles.map((role) => new RoleResource(role));
  }

  toJSON() {
    const result: any = {
      uuid: this.uuid,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
    };

    if (this.menuAccess !== undefined) {
      result.menuAccess = this.menuAccess;
    }

    return result;
  }
}

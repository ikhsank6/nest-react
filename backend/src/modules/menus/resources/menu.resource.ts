export class MenuResource {
  uuid: string;
  name: string;
  path: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  parent?: {
    uuid: string;
    name: string;
  } | null;
  children?: MenuResource[];

  constructor(menu: any) {
    this.uuid = menu.uuid;
    this.name = menu.name;
    this.path = menu.path || null;
    this.icon = menu.icon || null;
    this.order = menu.order;
    this.isActive = menu.isActive;
    this.createdAt = menu.createdAt?.toISOString?.() || menu.createdAt;
    this.updatedAt = menu.updatedAt?.toISOString?.() || menu.updatedAt;
    this.createdBy = menu.createdBy || null;
    this.updatedBy = menu.updatedBy || null;

    if (menu.parent !== undefined) {
      this.parent = menu.parent
        ? {
            uuid: menu.parent.uuid,
            name: menu.parent.name,
          }
        : null;
    }

    if (menu.children) {
      this.children = MenuResource.collection(menu.children);
    }
  }

  static collection(menus: any[]): MenuResource[] {
    return menus.map((menu) => new MenuResource(menu));
  }

  toJSON(): any {
    const result: any = {
      uuid: this.uuid,
      name: this.name,
      path: this.path,
      icon: this.icon,
      order: this.order,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
    };

    if (this.parent !== undefined) {
      result.parent = this.parent;
    }

    if (this.children !== undefined) {
      result.children = this.children.map((c) => c.toJSON());
    }

    return result;
  }
}

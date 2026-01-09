export class UserResource {
  uuid: string;
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  role: {
    uuid: string;
    name: string;
    description?: string;
  } | null;

  constructor(user: any) {
    this.uuid = user.uuid;
    this.name = user.name;
    this.email = user.email;
    this.avatar = user.avatar || null;
    this.isActive = user.isActive;
    this.verifiedAt = user.verifiedAt?.toISOString?.() || user.verifiedAt || null;
    this.createdAt = user.createdAt?.toISOString?.() || user.createdAt;
    this.updatedAt = user.updatedAt?.toISOString?.() || user.updatedAt;
    this.createdBy = user.createdBy || null;
    this.updatedBy = user.updatedBy || null;
    this.role = user.role
      ? {
          uuid: user.role.uuid,
          name: user.role.name,
          description: user.role.description,
        }
      : null;
  }

  static collection(users: any[]): UserResource[] {
    return users.map((user) => new UserResource(user));
  }

  toJSON() {
    return {
      uuid: this.uuid,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      isActive: this.isActive,
      verifiedAt: this.verifiedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      role: this.role,
    };
  }
}

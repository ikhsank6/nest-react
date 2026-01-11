export class NewsCategoryResource {
    uuid: string;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    newsCount: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;

    constructor(category: any) {
        this.uuid = category.uuid;
        this.name = category.name;
        this.slug = category.slug;
        this.description = category.description || null;
        this.isActive = category.isActive;
        this.newsCount = category._count?.news || 0;
        this.createdAt = category.createdAt?.toISOString?.() || category.createdAt;
        this.updatedAt = category.updatedAt?.toISOString?.() || category.updatedAt;
        this.createdBy = category.createdBy || null;
        this.updatedBy = category.updatedBy || null;
    }

    static collection(categories: any[]): NewsCategoryResource[] {
        return categories.map((category) => new NewsCategoryResource(category));
    }

    toJSON() {
        return {
            uuid: this.uuid,
            name: this.name,
            slug: this.slug,
            description: this.description,
            isActive: this.isActive,
            newsCount: this.newsCount,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
        };
    }
}

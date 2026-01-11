export class AboutUsResource {
    uuid: string;
    section: string;
    title: string;
    content: string;
    image: string | null;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;

    constructor(aboutUs: any) {
        this.uuid = aboutUs.uuid;
        this.section = aboutUs.section;
        this.title = aboutUs.title;
        this.content = aboutUs.content;
        this.image = aboutUs.image || null;
        this.order = aboutUs.order;
        this.isActive = aboutUs.isActive;
        this.createdAt = aboutUs.createdAt?.toISOString?.() || aboutUs.createdAt;
        this.updatedAt = aboutUs.updatedAt?.toISOString?.() || aboutUs.updatedAt;
        this.createdBy = aboutUs.createdBy || null;
        this.updatedBy = aboutUs.updatedBy || null;
    }

    static collection(items: any[]): AboutUsResource[] {
        return items.map((item) => new AboutUsResource(item));
    }

    toJSON() {
        return {
            uuid: this.uuid,
            section: this.section,
            title: this.title,
            content: this.content,
            image: this.image,
            order: this.order,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
        };
    }
}

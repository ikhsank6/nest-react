import { MediaResource } from '../../../../media/resources/media.resource';

export class CarouselResource {
    uuid: string;
    title: string;
    subtitle: string | null;
    image: string | null;
    media: MediaResource | null;
    link: string | null;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;

    constructor(carousel: any) {
        this.uuid = carousel.uuid;
        this.title = carousel.title;
        this.subtitle = carousel.subtitle || null;
        this.image = carousel.image || null;
        this.media = MediaResource.fromEntity(carousel.media);
        this.link = carousel.link || null;
        this.order = carousel.order;
        this.isActive = carousel.isActive;
        this.createdAt = carousel.createdAt?.toISOString?.() || carousel.createdAt;
        this.updatedAt = carousel.updatedAt?.toISOString?.() || carousel.updatedAt;
        this.createdBy = carousel.createdBy || null;
        this.updatedBy = carousel.updatedBy || null;
    }

    static collection(carousels: any[]): CarouselResource[] {
        return carousels.map((carousel) => new CarouselResource(carousel));
    }

    toJSON() {
        return {
            uuid: this.uuid,
            title: this.title,
            subtitle: this.subtitle,
            image: this.image,
            media: this.media,
            link: this.link,
            order: this.order,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
        };
    }
}

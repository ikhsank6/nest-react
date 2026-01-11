import { MediaResource } from '../../../../media/resources/media.resource';

export class AboutUsResource {
    uuid: string;
    companyName: string;
    description: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    whatsapp: string | null;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
    linkedin: string | null;
    latitude: number | null;
    longitude: number | null;
    mapsUrl: string | null;
    logo: string | null;
    media: MediaResource | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;

    constructor(aboutUs: any) {
        this.uuid = aboutUs.uuid;
        this.companyName = aboutUs.companyName;
        this.description = aboutUs.description;
        this.address = aboutUs.address || null;
        this.phone = aboutUs.phone || null;
        this.email = aboutUs.email || null;
        this.whatsapp = aboutUs.whatsapp || null;
        this.facebook = aboutUs.facebook || null;
        this.instagram = aboutUs.instagram || null;
        this.twitter = aboutUs.twitter || null;
        this.youtube = aboutUs.youtube || null;
        this.linkedin = aboutUs.linkedin || null;
        this.latitude = aboutUs.latitude ? parseFloat(aboutUs.latitude) : null;
        this.longitude = aboutUs.longitude ? parseFloat(aboutUs.longitude) : null;
        this.mapsUrl = aboutUs.mapsUrl || null;
        this.logo = aboutUs.logo || null;
        this.media = MediaResource.fromEntity(aboutUs.media);
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
            companyName: this.companyName,
            description: this.description,
            address: this.address,
            phone: this.phone,
            email: this.email,
            whatsapp: this.whatsapp,
            facebook: this.facebook,
            instagram: this.instagram,
            twitter: this.twitter,
            youtube: this.youtube,
            linkedin: this.linkedin,
            latitude: this.latitude,
            longitude: this.longitude,
            mapsUrl: this.mapsUrl,
            logo: this.logo,
            media: this.media,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
        };
    }
}

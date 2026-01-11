export class MediaResource {
    uuid: string;
    filename: string;
    original_name: string;
    url: string;

    constructor(media: any) {
        this.uuid = media.uuid;
        this.filename = media.filename;
        this.original_name = media.originalName || media.original_name;
        this.url = `/upload/images/${media.uuid}`;
    }

    static fromEntity(media: any): MediaResource | null {
        if (!media) return null;
        return new MediaResource(media);
    }

    toJSON() {
        return {
            uuid: this.uuid,
            filename: this.filename,
            original_name: this.original_name,
            url: this.url,
        };
    }
}

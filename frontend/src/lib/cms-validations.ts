import { z } from 'zod';

// Carousel schemas
export const carouselFormSchema = z.object({
    title: z.string().min(1, 'Judul harus diisi').max(100, 'Judul maksimal 100 karakter'),
    subtitle: z.string().optional().or(z.literal('')),
    image: z.any().optional().nullable(),
    mediaUuid: z.string().optional().or(z.literal('')),
    link: z.string().optional().or(z.literal('')),
    order: z.coerce.number().optional(),
    isActive: z.boolean().optional(),
});

export type CarouselFormData = z.infer<typeof carouselFormSchema>;

// News Category schemas
export const newsCategoryFormSchema = z.object({
    name: z.string().min(1, 'Nama harus diisi').max(100, 'Nama maksimal 100 karakter'),
    slug: z.string().min(1, 'Slug harus diisi').max(100, 'Slug maksimal 100 karakter'),
    description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional().or(z.literal('')),
    isActive: z.boolean().optional(),
});

export type NewsCategoryFormData = z.infer<typeof newsCategoryFormSchema>;

// About Us schemas
export const aboutUsFormSchema = z.object({
    companyName: z.string().min(1, 'Nama perusahaan harus diisi').max(100, 'Nama maksimal 100 karakter'),
    description: z.string().min(1, 'Deskripsi harus diisi'),
    address: z.string().min(1, 'Alamat harus diisi').max(255, 'Alamat maksimal 255 karakter'),
    phone: z.string().min(1, 'Nomor telepon harus diisi').max(20, 'Nomor telepon maksimal 20 karakter'),
    email: z.string().min(1, 'Email harus diisi').email('Email tidak valid'),
    whatsapp: z.string().max(20, 'Nomor WhatsApp maksimal 20 karakter').optional().or(z.literal('')),
    facebook: z.string().max(255, 'URL Facebook maksimal 255 karakter').optional().or(z.literal('')),
    instagram: z.string().max(255, 'URL Instagram maksimal 255 karakter').optional().or(z.literal('')),
    twitter: z.string().max(255, 'URL Twitter maksimal 255 karakter').optional().or(z.literal('')),
    youtube: z.string().max(255, 'URL YouTube maksimal 255 karakter').optional().or(z.literal('')),
    linkedin: z.string().max(255, 'URL LinkedIn maksimal 255 karakter').optional().or(z.literal('')),
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable(),
    mapsUrl: z.string().optional().or(z.literal('')),
    logo: z.string().max(255, 'URL logo maksimal 255 karakter').optional().or(z.literal('')),
    image: z.any().optional().nullable(),
    mediaUuid: z.string().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
});

export type AboutUsFormData = z.infer<typeof aboutUsFormSchema>;

// News schemas
export const newsFormSchema = z.object({
    title: z.string().min(1, 'Judul harus diisi').max(200, 'Judul maksimal 200 karakter'),
    slug: z.string().min(1, 'Slug harus diisi').max(200, 'Slug maksimal 200 karakter'),
    excerpt: z.string().max(500, 'Ringkasan maksimal 500 karakter').optional().or(z.literal('')),
    content: z.string().min(1, 'Konten harus diisi'),
    image: z.any().optional().nullable(),
    mediaUuid: z.string().optional().or(z.literal('')),
    categoryUuid: z.string().min(1, 'Kategori harus dipilih'),
    publishedAt: z.string().optional().or(z.literal('')),
    isPublished: z.boolean().optional(),
});

export type NewsFormData = z.infer<typeof newsFormSchema>;

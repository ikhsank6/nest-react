import { z } from 'zod';

// Carousel schemas
export const carouselFormSchema = z.object({
    title: z.string().min(1, 'Judul harus diisi').max(100, 'Judul maksimal 100 karakter'),
    subtitle: z.string().max(200, 'Subtitle maksimal 200 karakter').optional().or(z.literal('')),
    image: z.string().min(1, 'URL gambar harus diisi'),
    link: z.string().max(255, 'Link maksimal 255 karakter').optional().or(z.literal('')),
    order: z.coerce.number().int().min(0, 'Urutan minimal 0').optional(),
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
    section: z.string().min(1, 'Section harus diisi').max(50, 'Section maksimal 50 karakter'),
    title: z.string().min(1, 'Judul harus diisi').max(100, 'Judul maksimal 100 karakter'),
    content: z.string().min(1, 'Konten harus diisi'),
    image: z.string().max(255, 'URL gambar maksimal 255 karakter').optional().or(z.literal('')),
    order: z.coerce.number().int().min(0, 'Urutan minimal 0').optional(),
    isActive: z.boolean().optional(),
});

export type AboutUsFormData = z.infer<typeof aboutUsFormSchema>;

// News schemas
export const newsFormSchema = z.object({
    title: z.string().min(1, 'Judul harus diisi').max(200, 'Judul maksimal 200 karakter'),
    slug: z.string().min(1, 'Slug harus diisi').max(200, 'Slug maksimal 200 karakter'),
    excerpt: z.string().max(500, 'Ringkasan maksimal 500 karakter').optional().or(z.literal('')),
    content: z.string().min(1, 'Konten harus diisi'),
    featuredImage: z.string().max(255, 'URL gambar maksimal 255 karakter').optional().or(z.literal('')),
    categoryUuid: z.string().min(1, 'Kategori harus dipilih'),
    publishedAt: z.string().optional().or(z.literal('')),
    isPublished: z.boolean().optional(),
});

export type NewsFormData = z.infer<typeof newsFormSchema>;

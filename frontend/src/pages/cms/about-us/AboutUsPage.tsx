import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aboutUsService, type AboutUs, type CreateAboutUsData, type UpdateAboutUsData } from '@/services/about-us.service';
import { aboutUsFormSchema, type AboutUsFormData } from '@/lib/cms-validations';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Phone, MapPin } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { AuditInfo } from '@/components/ui/audit-info';
import { AboutUsFormDrawer } from '@/components/cms/about-us';
import { useTable } from '@/hooks/useTable';

import { env } from '@/config/env';

export default function AboutUsPage() {
  const {
    data: profileData,
    loading,
    error,
    refresh: fetchData,
  } = useTable<AboutUs>('about-us', useCallback(async () => {
    const data = await aboutUsService.get();
    return {
      data: data ? [data] : [],
      meta: {
        page: {
          total: data ? 1 : 0
        }
      }
    };
  }, []));

  const profile = profileData.length > 0 ? profileData[0] : null;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const getFullUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${env.API_URL}${url}`;
  };

  const form = useForm<AboutUsFormData>({
    resolver: zodResolver(aboutUsFormSchema) as any,
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      whatsapp: '',
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      linkedin: '',
      latitude: null,
      longitude: null,
      mapsUrl: '',
      logo: '',
      image: null,
      mediaUuid: '',
      isActive: true,
    },
  });

  const openCreateDrawer = () => {
    form.reset({
      companyName: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      whatsapp: '',
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      linkedin: '',
      latitude: null,
      longitude: null,
      mapsUrl: '',
      logo: '',
      image: null,
      mediaUuid: '',
      isActive: true,
    });
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: AboutUs) => {
    form.reset({
      companyName: item.companyName || '',
      description: item.description || '',
      address: item.address || '',
      phone: item.phone || '',
      email: item.email || '',
      whatsapp: item.whatsapp || '',
      facebook: item.facebook || '',
      instagram: item.instagram || '',
      twitter: item.twitter || '',
      youtube: item.youtube || '',
      linkedin: item.linkedin || '',
      latitude: item.latitude,
      longitude: item.longitude,
      mapsUrl: item.mapsUrl || '',
      logo: item.logo || '',
      image: item.media || null,
      mediaUuid: item.media?.uuid || '',
      isActive: item.isActive ?? true,
    });
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleSubmit = async (formData: AboutUsFormData) => {
    setSubmitting(true);
    try {
      if (drawerMode === 'create') {
        await aboutUsService.create(formData as CreateAboutUsData);
        showSuccess('Profil perusahaan berhasil dibuat');
      } else if (drawerMode === 'edit' && profile) {
        await aboutUsService.update(profile.uuid, formData as UpdateAboutUsData);
        showSuccess('Profil perusahaan berhasil diupdate');
      }
      setDrawerOpen(false);
      fetchData();
    } catch (err) {
      showError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const url = e.target.value;
    
    // Extract lat/long from Google Maps URL
    const regex1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const regex2 = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
    
    let match = url.match(regex1);
    if (!match) match = url.match(regex2);
    
    if (match) {
      form.setValue('latitude', parseFloat(match[1]));
      form.setValue('longitude', parseFloat(match[2]));
    }
  };

  const columns: Column<AboutUs>[] = [
    {
      key: 'company',
      header: 'Perusahaan',
      cell: (item) => (
        <div className="flex items-center gap-3">
          {(item.media?.url || item.logo) && (
            <img 
              src={getFullUrl(item.media?.url || item.logo)} 
              alt={item.companyName} 
              className="h-8 w-8 rounded object-contain border bg-background" 
            />
          )}
          <div className="flex flex-col">
            <span className="font-bold">{item.companyName}</span>
            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{item.description}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Kontak',
      cell: (item) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{item.email}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{item.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Lokasi',
      cell: (item) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="line-clamp-1 max-w-[150px]">{item.address}</span>
          </div>
          <span className="text-[10px] text-muted-foreground ml-4.5">
            {item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : 'Koordinat tidak set'}
          </span>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Diperbarui',
      cell: (item) => <AuditInfo createdAt={item.updatedAt} createdBy={item.updatedBy || item.createdBy} />,
    },
  ];

  const tableActions: TableActions<AboutUs> = {
    onEdit: openEditDrawer,
  };

  return (
    <div className="w-full">
      <DataTable
        title="Profil Perusahaan"
        description="Kelola informasi profil perusahaan untuk halaman About Us."
        data={profileData}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={fetchData}
        keyExtractor={(item) => item.uuid}
        showPagination={false}
        showViewToggle={false}
        emptyMessage="Profil perusahaan belum dibuat."
        headerAction={
          !profile && !loading && (
            <Button onClick={openCreateDrawer}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Profil
            </Button>
          )
        }
      />

      <AboutUsFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={submitting}
        onUrlChange={handleUrlChange}
      />
    </div>
  );
}

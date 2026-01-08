import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { type Role } from '@/services/role.service';
import { menuService, type Menu } from '@/services/menu.service';
import { menuAccessService, type MenuAccessItemDto } from '@/services/menu-access.service';

interface MenuAccessDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}

export function MenuAccessDrawer({ open, onOpenChange, role }: MenuAccessDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [accessMap, setAccessMap] = useState<Record<string, MenuAccessItemDto>>({});

  // Flatten menus helper
  const flattenMenus = (items: Menu[]): Menu[] => {
    let result: Menu[] = [];
    items.forEach(item => {
      result.push(item);
      if (item.children) {
        result = result.concat(flattenMenus(item.children));
      }
    });
    return result;
  };

  useEffect(() => {
    if (open && role) {
      loadData();
    }
  }, [open, role]);

  const loadData = async () => {
    if (!role) return;
    setLoading(true);
    try {
      // Fetch all menus and current access in parallel
      const [allMenus, currentAccess] = await Promise.all([
        menuService.getAll(),
        menuAccessService.findByRole(role.uuid),
      ]);

      const flatList = flattenMenus(allMenus);
      setMenus(flatList);

      // Initialize access map
      const initialMap: Record<string, MenuAccessItemDto> = {};
      
      // Default unchecked
      flatList.forEach(m => {
        initialMap[m.uuid] = {
          menuUuid: m.uuid,
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false,
        };
      });

      // Apply fetching permissions
      currentAccess.forEach((acc) => {
        if (acc.menu?.uuid) {
          initialMap[acc.menu.uuid] = {
            menuUuid: acc.menu.uuid,
            canView: acc.canView,
            canCreate: acc.canCreate,
            canEdit: acc.canEdit,
            canDelete: acc.canDelete,
          };
        }
      });

      setAccessMap(initialMap);
    } catch (error) {
      toast.error('Gagal memuat data menu access');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckChange = (menuUuid: string, field: keyof MenuAccessItemDto, checked: boolean) => {
    setAccessMap(prev => ({
      ...prev,
      [menuUuid]: {
        ...prev[menuUuid],
        [field]: checked
      }
    }));
  };

  const handleSave = async () => {
    if (!role) return;
    setSaving(true);
    try {
      // Transform map to array
      const menuAccess = Object.values(accessMap).filter(item => 
        item.canView || item.canCreate || item.canEdit || item.canDelete
      );

      await menuAccessService.bulkUpdate({
        roleUuid: role.uuid,
        menuAccess,
      });

      toast.success('Permissions berhasil disimpan');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal menyimpan permissions');
    } finally {
      setSaving(false);
    }
  };

  if (!role) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto flex flex-col h-full">
        <SheetHeader className="mb-4">
          <SheetTitle>Manage Permissions</SheetTitle>
          <SheetDescription>
            Atur hak akses menu untuk role <strong>{role.name}</strong>.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto -mx-6 px-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Menu</TableHead>
                  <TableHead className="text-center">View</TableHead>
                  <TableHead className="text-center">Create</TableHead>
                  <TableHead className="text-center">Edit</TableHead>
                  <TableHead className="text-center">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus.map((menu) => (
                  <TableRow key={menu.uuid}>
                    <TableCell className="font-medium">
                      <div style={{ marginLeft: menu.parent ? '20px' : '0px' }}>
                         {menu.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={accessMap[menu.uuid]?.canView} 
                        onCheckedChange={(c) => handleCheckChange(menu.uuid, 'canView', c as boolean)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={accessMap[menu.uuid]?.canCreate} 
                        onCheckedChange={(c) => handleCheckChange(menu.uuid, 'canCreate', c as boolean)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={accessMap[menu.uuid]?.canEdit} 
                        onCheckedChange={(c) => handleCheckChange(menu.uuid, 'canEdit', c as boolean)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={accessMap[menu.uuid]?.canDelete} 
                        onCheckedChange={(c) => handleCheckChange(menu.uuid, 'canDelete', c as boolean)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <SheetFooter className="mt-4 pt-4 border-t sticky bottom-0 bg-background">
          <div className="flex gap-2 w-full justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Changes
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

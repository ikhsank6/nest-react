import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import { type Role } from '@/services/role.service';
import { menuService, type Menu } from '@/services/menu.service';
import { menuAccessService } from '@/services/menu-access.service';
import { cn, showSuccess, showError } from '@/lib/utils';

interface MenuAccessDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}

interface MenuTreeItemProps {
  menu: Menu;
  accessMap: Record<string, boolean>;
  onToggle: (uuid: string, checked: boolean) => void;
  level?: number;
}

function MenuTreeItem({ menu, accessMap, onToggle, level = 0 }: MenuTreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = menu.children && menu.children.length > 0;
  const isChecked = accessMap[menu.uuid] || false;

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col">
      <div 
        className={cn(
          "flex items-center py-2 px-2 hover:bg-accent/50 rounded-md transition-colors cursor-pointer group",
          isChecked && "bg-primary/5"
        )}
        onClick={() => onToggle(menu.uuid, !isChecked)}
      >
        <div style={{ width: `${level * 24}px` }} />
        
        <div className="flex items-center gap-2 flex-1">
          {hasChildren ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0 hover:bg-transparent"
              onClick={toggleOpen}
            >
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
            <div className="w-5" />
          )}
          
          {hasChildren ? (
            <Folder className={cn("h-4 w-4", isChecked ? "text-primary" : "text-muted-foreground")} />
          ) : (
            <File className={cn("h-4 w-4", isChecked ? "text-primary" : "text-muted-foreground")} />
          )}
          
          <span className={cn(
            "text-sm font-medium",
            isChecked ? "text-primary" : "text-foreground"
          )}>
            {menu.name}
          </span>
        </div>

        <Checkbox 
          checked={isChecked} 
          onCheckedChange={(checked) => onToggle(menu.uuid, checked as boolean)}
          className="ml-2"
        />
      </div>

      {hasChildren && isOpen && (
        <div className="flex flex-col">
          {menu.children!.map((child) => (
            <MenuTreeItem 
              key={child.uuid} 
              menu={child} 
              accessMap={accessMap} 
              onToggle={onToggle} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function MenuAccessDrawer({ open, onOpenChange, role }: MenuAccessDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuTree, setMenuTree] = useState<Menu[]>([]);
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({});
  const [parentMap, setParentMap] = useState<Record<string, string>>({}); // childUuid -> parentUuid

  useEffect(() => {
    if (open && role) {
      loadData();
    }
  }, [open, role]);

  const loadData = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const allMenusResponse = await menuService.getTree();
      const allMenus = allMenusResponse.data || [];
      const currentAccess = await menuAccessService.findByRole(role.uuid);

      setMenuTree(allMenus);

      // Initialize access map and parent map
      const initialMap: Record<string, boolean> = {};
      const initialParentMap: Record<string, string> = {};
      
      const processItem = (item: Menu, parentUuid?: string) => {
        initialMap[item.uuid] = false;
        if (parentUuid) {
          initialParentMap[item.uuid] = parentUuid;
        }
        if (item.children) {
          item.children.forEach(child => processItem(child, item.uuid));
        }
      };
      allMenus.forEach((item: Menu) => processItem(item));

      currentAccess.forEach((acc) => {
        if (acc.menu?.uuid) {
          initialMap[acc.menu.uuid] = true;
        }
      });

      setAccessMap(initialMap);
      setParentMap(initialParentMap);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (uuid: string, checked: boolean) => {
    setAccessMap(prev => {
      const newMap = { ...prev };
      
      const toggleWithChildren = (id: string, isChecked: boolean) => {
        newMap[id] = isChecked;
        
        // Find children in menuTree recursively (this is slow if tree is deep, but menu is usually small)
        const findAndToggleChildren = (items: Menu[]) => {
          for (const item of items) {
            if (item.uuid === id) {
              const toggleAllChildren = (child: Menu) => {
                newMap[child.uuid] = isChecked;
                if (child.children) child.children.forEach(toggleAllChildren);
              };
              if (item.children) item.children.forEach(toggleAllChildren);
              return true;
            }
            if (item.children && findAndToggleChildren(item.children)) return true;
          }
          return false;
        };
        findAndToggleChildren(menuTree);
      };

      toggleWithChildren(uuid, checked);

      // If checked, recursively check parents
      if (checked) {
        let currentParentUuid = parentMap[uuid];
        while (currentParentUuid) {
          newMap[currentParentUuid] = true;
          currentParentUuid = parentMap[currentParentUuid];
        }
      }
      
      return newMap;
    });
  };

  const handleSave = async () => {
    if (!role) return;
    setSaving(true);
    try {
      const menuUuids = Object.entries(accessMap)
        .filter(([_, checked]) => checked)
        .map(([uuid, _]) => uuid);

      await menuAccessService.bulkUpdate({
        roleUuid: role.uuid,
        menuUuids,
      });

      showSuccess('Hak akses berhasil disimpan');
      onOpenChange(false);
    } catch (error: any) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  if (!role) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl flex flex-col h-full bg-background border-l shadow-2xl">
        <SheetHeader className="pb-6 border-b">
          <SheetTitle className="text-2xl font-bold">Manage Menu Access</SheetTitle>
          <SheetDescription className="text-base">
            Pilih menu-menu yang dapat diakses oleh role <span className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4">{role.name}</span>.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 px-1">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-60 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse font-medium">Memuat struktur menu...</p>
            </div>
          ) : (
            <div className="space-y-1 pr-4">
              {menuTree.length > 0 ? (
                menuTree.map((menu) => (
                  <MenuTreeItem 
                    key={menu.uuid} 
                    menu={menu} 
                    accessMap={accessMap} 
                    onToggle={handleToggle} 
                  />
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/20">
                  <p className="text-muted-foreground">Tidak ada menu yang tersedia.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="mt-auto pt-6 border-t bg-background/80 backdrop-blur-sm sticky bottom-0">
          <div className="flex gap-3 w-full justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving} className="px-8">
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving || loading} className="px-8 shadow-lg shadow-primary/20">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Hak Akses'
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

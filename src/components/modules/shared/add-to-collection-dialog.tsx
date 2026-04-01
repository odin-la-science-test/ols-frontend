'use client';

import { type ReactNode, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, Plus, Library } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { toast } from '@/hooks';
import {
  useMyCollections,
  useCreateCollection,
  useAddItem,
} from '@/features/study-collections/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// ADD TO COLLECTION DIALOG — Overlay to add an entity to a study collection
// ═══════════════════════════════════════════════════════════════════════════

interface AddToCollectionDialogProps {
  moduleId: string;
  entityId: number;
  trigger: ReactNode;
}

export function AddToCollectionDialog({ moduleId, entityId, trigger }: AddToCollectionDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const { data: collections = [] } = useMyCollections();
  const addItemMutation = useAddItem();
  const createMutation = useCreateCollection();

  const handleAddToCollection = (collectionId: number) => {
    addItemMutation.mutate(
      { collectionId, data: { moduleId, entityId } },
      {
        onSuccess: () => {
          toast({ title: t('entityActions.addedToCollection') });
          setOpen(false);
        },
      },
    );
  };

  const handleCreateAndAdd = () => {
    if (!newName.trim()) return;
    createMutation.mutate(
      { name: newName.trim() },
      {
        onSuccess: (created) => {
          setNewName('');
          addItemMutation.mutate(
            { collectionId: created.id, data: { moduleId, entityId } },
            {
              onSuccess: () => {
                toast({ title: t('entityActions.addedToCollection') });
                setOpen(false);
              },
            },
          );
        },
      },
    );
  };

  const isEntityInCollection = (collectionId: number): boolean => {
    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return false;
    return collection.items.some(
      (item) => item.moduleId === moduleId && item.entityId === entityId,
    );
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setOpen(false)}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background border border-border rounded-lg shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Library className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">
                    {t('entityActions.addToCollection')}
                  </h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-muted/50 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Collection list */}
              <div className="max-h-56 overflow-y-auto p-2">
                {collections.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {t('entityActions.createCollection')}
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {collections.map((collection) => {
                      const alreadyAdded = isEntityInCollection(collection.id);
                      return (
                        <button
                          key={collection.id}
                          onClick={() => !alreadyAdded && handleAddToCollection(collection.id)}
                          disabled={alreadyAdded || addItemMutation.isPending}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors disabled:opacity-60 disabled:cursor-default"
                        >
                          <span className="truncate">{collection.name}</span>
                          {alreadyAdded && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                              <Check className="w-3.5 h-3.5 text-green-500" />
                              {t('entityActions.alreadyInCollection')}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Create new */}
              <div className="border-t border-border/50 p-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t('entityActions.createCollection')}
                    className="h-8 text-xs flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateAndAdd();
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCreateAndAdd}
                    disabled={!newName.trim() || createMutation.isPending}
                    className="h-8 px-2 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

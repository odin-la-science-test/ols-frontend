import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, Download, Trash2 } from 'lucide-react';
import {
  Button,
  Input,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui';
import { FormSection } from '@/components/modules/shared';
import { toast } from '@/hooks';
import { useAuthStore } from '@/stores';
import api from '@/api/axios';
import { logger } from '@/lib/logger';

// ─── Data Section ───

export function DataSection() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ─── Export handler ───
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const response = await api.get('/user/data-export');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ols-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: t('settingsPage.dataExportSuccess') });
    } catch (error) {
      logger.error('[DataSection] Export failed', error);
      toast({ title: t('settingsPage.dataExportError'), variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  }, [t]);

  // ─── Delete account handler ───
  const handleDeleteAccount = useCallback(async () => {
    if (!confirmEmail || confirmEmail !== user?.email) return;

    setDeleting(true);
    try {
      await api.delete('/user/account', { data: { confirmEmail } });
      toast({ title: t('settingsPage.dataDeleteSuccess') });
      logout();
      window.location.href = '/login';
    } catch (error) {
      logger.error('[DataSection] Account deletion failed', error);
      toast({ title: t('settingsPage.dataDeleteError'), variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  }, [confirmEmail, user?.email, logout, t]);

  const emailMatches = confirmEmail === user?.email;

  return (
    <FormSection
      id="data"
      title={t('settingsPage.data')}
      icon={Database}
      delay={9}
    >
      <div className="space-y-6">
        {/* ─── Export ─── */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('settingsPage.dataExportDesc')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            loading={exporting}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t('settingsPage.dataExportButton')}
          </Button>
        </div>

        {/* ─── Separator ─── */}
        <div className="border-t border-border/30" />

        {/* ─── Delete account ─── */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('settingsPage.dataDeleteDesc')}
          </p>
          <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setConfirmEmail('');
          }}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                {t('settingsPage.dataDeleteButton')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('settingsPage.dataDeleteButton')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('settingsPage.dataDeleteWarning')}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-2 py-2">
                <label className="text-sm font-medium">
                  {t('settingsPage.dataDeleteConfirmLabel')}
                </label>
                <Input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={t('settingsPage.dataDeleteEmailPlaceholder')}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t('common.cancel')}
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={!emailMatches}
                  loading={deleting}
                >
                  {t('settingsPage.dataDeleteConfirm')}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </FormSection>
  );
}

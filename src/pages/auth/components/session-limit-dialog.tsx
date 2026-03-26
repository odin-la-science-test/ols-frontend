import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Laptop, Smartphone, Tablet, LogOut, Loader2, AlertTriangle, X } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { authApi, type SessionDTO, type SessionLimitResponse } from '@/api/endpoints/auth';

function DeviceIcon({ deviceInfo }: { deviceInfo: string }) {
  const lower = deviceInfo.toLowerCase();
  const cls = "w-4 h-4 text-muted-foreground";
  if (lower.includes('android') || lower.includes('iphone'))
    return <Smartphone className={cls} strokeWidth={1.5} />;
  if (lower.includes('ipad') || lower.includes('tablet'))
    return <Tablet className={cls} strokeWidth={1.5} />;
  return <Laptop className={cls} strokeWidth={1.5} />;
}

interface SessionLimitDialogProps {
  data: SessionLimitResponse;
  credentials: { email: string; password: string };
  onRevoked: () => void;
  onClose: () => void;
}

export function SessionLimitDialog({ data, credentials, onRevoked, onClose }: SessionLimitDialogProps) {
  const { t } = useTranslation();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleRevoke = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await authApi.revokeSessionPublic({
        email: credentials.email,
        password: credentials.password,
        sessionId,
      });
      onRevoked();
    } catch {
      setRevokingId(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 scrim-heavy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card variant="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-base">{t('auth.sessionLimitTitle')}</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t('auth.sessionLimitMessage', { max: data.maxSessions })}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.activeSessions.map((session: SessionDTO) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 bg-card/50"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center">
                      <DeviceIcon deviceInfo={session.deviceInfo} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.deviceInfo}</p>
                      <p className="text-xs text-muted-foreground">{session.ipAddress}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(session.id)}
                      disabled={revokingId !== null}
                      className="text-xs text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                      {revokingId === session.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                      )}
                      <span className="ml-1">{t('profile.revokeSession')}</span>
                    </Button>
                  </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

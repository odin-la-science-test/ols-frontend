import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
} from '@/components/ui';
import { AuthLayout, AuthHeader } from '@/components/common';
import { authApi } from '@/api/endpoints/auth';

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    authApi.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/'), 3000);
      })
      .catch(() => setStatus('error'));
  }, [token, navigate]);

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification();
    } catch {
      // silently fail
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <AuthHeader subtitle={t('common.tagline')} compact />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card variant="glass">
            <CardContent className="text-center space-y-4 py-8">
              {status === 'loading' && (
                <>
                  <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">{t('auth.verifyEmailLoading')}</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">{t('auth.verifyEmailSuccess')}</p>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="w-12 h-12 text-destructive mx-auto" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">{t('auth.verifyEmailExpired')}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    loading={resending}
                  >
                    {t('auth.verifyEmailResend')}
                  </Button>
                </>
              )}

              <Link
                to="/login"
                className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('auth.backToLogin')}
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AuthLayout>
  );
}

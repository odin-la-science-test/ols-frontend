import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui';
import { AuthLayout, AuthHeader, AuthInputField } from '@/components/common';
import { authApi } from '@/api/endpoints/auth';

const forgotSchema = z.object({
  email: z.string().email('auth.emailInvalid').min(1, 'auth.emailRequired'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsPending(true);
    try {
      await authApi.forgotPassword(data.email);
    } catch {
      // Always show success (anti-enumeration)
    } finally {
      setIsPending(false);
      setSent(true);
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
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{t('auth.forgotPasswordTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sent ? (
                <div className="text-center space-y-4 py-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('auth.forgotPasswordSent')}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground text-center">
                    {t('auth.forgotPasswordDesc')}
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <AuthInputField
                      id="email"
                      type="email"
                      label={t('auth.email')}
                      placeholder={t('auth.emailPlaceholder')}
                      autoComplete="email"
                      register={register('email')}
                      error={errors.email ? t(errors.email.message || '') : undefined}
                      labelClassName="text-sm font-medium"
                      errorClassName="mt-1"
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      variant="default"
                      loading={isPending}
                    >
                      {t('auth.sendResetLink')}
                    </Button>
                  </form>
                </>
              )}

              <p className="text-center text-sm">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t('auth.backToLogin')}
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AuthLayout>
  );
}

import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui';
import { AuthLayout, AuthHeader, AuthInputField } from '@/components/common';
import { authApi } from '@/api/endpoints/auth';

const resetSchema = z
  .object({
    newPassword: z.string().min(4, 'auth.passwordMin'),
    confirmPassword: z.string().min(4, 'auth.passwordMin'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'auth.passwordMismatch',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) return;
    setIsPending(true);
    setError(false);
    try {
      await authApi.resetPassword(token, data.newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setError(true);
    } finally {
      setIsPending(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md">
          <AuthHeader subtitle={t('common.tagline')} compact />
          <Card variant="glass">
            <CardContent className="text-center space-y-4 py-8">
              <XCircle className="w-12 h-12 text-destructive mx-auto" />
              <p className="text-sm text-muted-foreground">{t('auth.resetPasswordInvalidToken')}</p>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('auth.backToLogin')}
              </Link>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    );
  }

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
              <CardTitle className="text-xl">{t('auth.resetPasswordTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {success ? (
                <div className="text-center space-y-4 py-4">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    {t('auth.resetPasswordSuccess')}
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                      <p className="text-sm text-destructive">{t('auth.resetPasswordInvalidToken')}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <AuthInputField
                      id="newPassword"
                      type="password"
                      label={t('auth.newPassword')}
                      placeholder={t('auth.passwordPlaceholder')}
                      autoComplete="new-password"
                      register={register('newPassword')}
                      error={errors.newPassword ? t(errors.newPassword.message || '') : undefined}
                      labelClassName="text-sm font-medium"
                      errorClassName="mt-1"
                    />

                    <AuthInputField
                      id="confirmPassword"
                      type="password"
                      label={t('auth.confirmPassword')}
                      placeholder={t('auth.confirmPasswordPlaceholder')}
                      autoComplete="new-password"
                      register={register('confirmPassword')}
                      error={errors.confirmPassword ? t(errors.confirmPassword.message || '') : undefined}
                      labelClassName="text-sm font-medium"
                      errorClassName="mt-1"
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      variant="gradient"
                      loading={isPending}
                    >
                      {t('auth.resetPassword')}
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

import { useState, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OAuthProviders } from './components/oauth-providers';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Separator,
} from '@/components/ui';
import { useLogin, useGuestLogin } from '@/hooks';
import { ApiErrorAlert, AuthLayout, AuthHeader, AuthInputField } from '@/components/common';
import { isApiError, type ApiError } from '@/api/errors';
import type { SessionLimitResponse } from '@/api/endpoints/auth';
import { SessionLimitDialog } from './components/session-limit-dialog';

const loginSchema = z.object({
  email: z.string().email('auth.emailInvalid').min(1, 'auth.emailRequired'),
  password: z.string().min(4, 'auth.passwordMin'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');
  const { mutate: login, isPending, error } = useLogin();
  const { mutate: loginAsGuest, isPending: isGuestPending, error: guestError } = useGuestLogin();
  const [sessionLimitData, setSessionLimitData] = useState<SessionLimitResponse | null>(null);
  const credentialsRef = useRef<{ email: string; password: string } | null>(null);

  const clearCredentials = useCallback(() => {
    credentialsRef.current = null;
  }, []);

  // Filtrer l'erreur de session limit (geree par le dialog)
  const isSessionLimitError = error && isApiError(error) && (error as ApiError).status === 409;
  const displayError = isSessionLimitError ? null : (error || guestError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    credentialsRef.current = { email: data.email, password: data.password };
    login(data, {
      onSuccess: () => {
        clearCredentials();
      },
      onError: (err) => {
        if (isApiError(err) && (err as ApiError).status === 409) {
          const responseData = (err as ApiError).originalError?.response?.data as SessionLimitResponse | undefined;
          if (responseData?.activeSessions) {
            setSessionLimitData(responseData);
            return;
          }
        }
        clearCredentials();
      },
    });
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <AuthHeader subtitle={t('common.tagline')} compact />

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card variant="glass">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{t('auth.signIn')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* OAuth Error */}
              {oauthError && (
                <ApiErrorAlert
                  error={{ message: t(`auth.oauthError.${oauthError}`, t('auth.oauthError.default')) }}
                  fallbackMessageKey="auth.loginFailed"
                />
              )}

              {/* Error Alert */}
              <ApiErrorAlert error={displayError} fallbackMessageKey="auth.loginFailed" />

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

                <AuthInputField
                  id="password"
                  type="password"
                  label={t('auth.password')}
                  placeholder={t('auth.passwordPlaceholder')}
                  autoComplete="current-password"
                  register={register('password')}
                  error={errors.password ? t(errors.password.message || '') : undefined}
                  labelClassName="text-sm font-medium"
                  errorClassName="mt-1"
                />

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="default"
                  loading={isPending}
                >
                  {t('auth.signIn')}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs uppercase text-muted-foreground">
                  {t('auth.or')}
                </span>
                <Separator className="flex-1" />
              </div>

              <OAuthProviders />

              {/* Guest Login */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => loginAsGuest()}
                loading={isGuestPending}
              >
                {t('auth.continueAsGuest')}
              </Button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-muted-foreground">
                {t('auth.noAccount')}{' '}
                <Link
                  to="/register"
                  className="relative text-primary font-medium transition-all duration-200 hover:text-primary/90 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-primary/60 after:transition-all after:duration-300 hover:after:w-full"
                >
                  {t('auth.signUp')}
                </Link>
              </p>

            </CardContent>
          </Card>

          {/* Discover Link — outside card */}
          <p className="text-center text-xs text-muted-foreground/40 mt-4">
            <Link
              to="/welcome"
              className="hover:text-muted-foreground transition-colors"
            >
              {t('auth.discoverPlatform')}
            </Link>
          </p>
        </motion.div>
      </div>

      {sessionLimitData && credentialsRef.current && (
        <SessionLimitDialog
          data={sessionLimitData}
          credentials={credentialsRef.current}
          onRevoked={() => {
            const creds = credentialsRef.current;
            setSessionLimitData(null);
            if (creds) {
              login(creds, {
                onSuccess: () => clearCredentials(),
                onError: () => clearCredentials(),
              });
            }
          }}
          onClose={() => {
            setSessionLimitData(null);
            clearCredentials();
          }}
        />
      )}
    </AuthLayout>
  );
}

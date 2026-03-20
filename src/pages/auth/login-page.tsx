import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

const loginSchema = z.object({
  email: z.string().email('auth.emailInvalid').min(1, 'auth.emailRequired'),
  password: z.string().min(4, 'auth.passwordMin'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { t } = useTranslation();
  const { mutate: login, isPending, error } = useLogin();
  const { mutate: loginAsGuest, isPending: isGuestPending, error: guestError } = useGuestLogin();

  // Combiner les erreurs (login classique ou guest)
  const displayError = error || guestError;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <AuthHeader 
          subtitle={t('common.tagline')}
        />

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card variant="glass">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">{t('auth.signIn')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Error Alert */}
              <ApiErrorAlert error={displayError} fallbackMessageKey="auth.loginFailed" />

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="gradient" 
                  size="lg"
                  loading={isPending}
                >
                  {t('auth.signIn')}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 py-2">
                <Separator className="flex-1" />
                <span className="text-xs uppercase text-muted-foreground">
                  {t('auth.or')}
                </span>
                <Separator className="flex-1" />
              </div>

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
              <p className="text-center text-sm text-muted-foreground pt-2">
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
        </motion.div>
      </div>
    </AuthLayout>
  );
}

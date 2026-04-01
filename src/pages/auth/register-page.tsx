import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Separator,
} from '@/components/ui';
import { useRegister } from '@/hooks';
import { Logo, ApiErrorAlert, AuthLayout, AuthHeader, AuthInputField } from '@/components/common';
import { OAuthProviders } from './components/oauth-providers';

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'auth.firstNameRequired'),
    lastName: z.string().min(1, 'auth.lastNameRequired'),
    email: z.string().email('auth.emailInvalid').min(1, 'auth.emailRequired'),
    password: z.string().min(8, 'auth.passwordMin'),
    confirmPassword: z.string().min(8, 'auth.passwordMin'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'auth.mustAcceptTerms',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.passwordMismatch',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { t } = useTranslation();
  // All keys are invoked explicitly to satisfy i18n extraction/type-safety rules
  const registerTranslations = {
    feature1Title: t('register.feature1Title'),
    feature1Desc: t('register.feature1Desc'),
    feature2Title: t('register.feature2Title'),
    feature2Desc: t('register.feature2Desc'),
    feature3Title: t('register.feature3Title'),
    feature3Desc: t('register.feature3Desc'),
    firstNameRequired: t('auth.firstNameRequired'),
    lastNameRequired: t('auth.lastNameRequired'),
    emailInvalid: t('auth.emailInvalid'),
    emailRequired: t('auth.emailRequired'),
    passwordMin: t('auth.passwordMin'),
    passwordMismatch: t('auth.passwordMismatch'),
    mustAcceptTerms: t('auth.mustAcceptTerms'),
    registerFailed: t('auth.registerFailed'),
  };

  const features = [
    {
      icon: Shield,
      title: registerTranslations.feature1Title,
      desc: registerTranslations.feature1Desc,
    },
    {
      icon: Zap,
      title: registerTranslations.feature2Title,
      desc: registerTranslations.feature2Desc,
    },
    {
      icon: Users,
      title: registerTranslations.feature3Title,
      desc: registerTranslations.feature3Desc,
    },
  ];
  const { mutate: registerUser, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      acceptTerms: false,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const acceptTerms = watch('acceptTerms');

  const onSubmit = (data: RegisterFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, acceptTerms: _, ...registerData } = data;
    registerUser(registerData);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-4xl mx-auto relative z-10">
        {/* Mobile Logo */}
        <div className="md:hidden">
          <AuthHeader showLogo={true} />
        </div>

        <motion.div
  initial={{ opacity: 0, y: 20, scale: 0.98 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.4 }}
>
  <Card variant="glass" className="overflow-hidden">
    <div className="grid md:grid-cols-2">
      {/* Left Side - Features */}
      <div className="hidden md:flex bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-8 flex-col justify-center border-r border-border/50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Desktop Logo */}
          <Logo size={60} className="mb-6" animate={false} />
          
          <h2 className="text-2xl font-bold mb-2 gradient-text">
            {t('register.whyJoin')}
          </h2>
          <p className="text-muted-foreground mb-8 text-sm">
            {t('register.whyJoinDesc')}
          </p>

          <div className="space-y-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">{t('auth.createAccount')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Alert */}
          <ApiErrorAlert error={error} fallbackMessageKey="auth.registerFailed" />

          <OAuthProviders />

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs uppercase text-muted-foreground">
              {t('auth.or')}
            </span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <AuthInputField
                id="firstName"
                label={t('auth.firstName')}
                register={register('firstName')}
                error={errors.firstName ? t(errors.firstName.message || '') : undefined}
                className="space-y-1.5"
                labelClassName="text-sm"
              />

              <AuthInputField
                id="lastName"
                label={t('auth.lastName')}
                register={register('lastName')}
                error={errors.lastName ? t(errors.lastName.message || '') : undefined}
                className="space-y-1.5"
                labelClassName="text-sm"
              />
            </div>

            <AuthInputField
              id="email"
              type="email"
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              autoComplete="email"
              register={register('email')}
              error={errors.email ? t(errors.email.message || '') : undefined}
              className="space-y-1.5"
              labelClassName="text-sm"
            />

            <AuthInputField
              id="password"
              type="password"
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              autoComplete="new-password"
              register={register('password')}
              error={errors.password ? t(errors.password.message || '') : undefined}
              className="space-y-1.5"
              labelClassName="text-sm"
            />

            <AuthInputField
              id="confirmPassword"
              type="password"
              label={t('auth.confirmPassword')}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              autoComplete="new-password"
              register={register('confirmPassword')}
              error={errors.confirmPassword ? t(errors.confirmPassword.message || '') : undefined}
              className="space-y-1.5"
              labelClassName="text-sm"
            />

                    {/* Terms Checkbox */}
                    <div className="space-y-1.5">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            {...register('acceptTerms')}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 border border-border rounded-md transition-all peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center hover:border-muted-foreground">
                            {acceptTerms && <Check className="h-3 w-3 text-primary-foreground" aria-hidden="true" />}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {t('auth.acceptTerms')}{' '}
                          <Link to="/terms" className="text-primary hover:text-primary/90 transition-colors">
                            {t('auth.termsOfService')}
                          </Link>{' '}
                          {t('auth.and')}{' '}
                          <Link to="/privacy" className="text-primary hover:text-primary/90 transition-colors">
                            {t('auth.privacyPolicy')}
                          </Link>
                        </span>
                      </label>
                      {errors.acceptTerms && (
                        <p className="text-xs text-destructive">
                          {t(errors.acceptTerms.message || '')}
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      variant="default" 
                      size="lg"
                      loading={isPending}
                      disabled={!isValid || isPending}
                    >
                      {t('auth.createAccount')}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-muted-foreground pt-2">
                    {t('auth.hasAccount')}{' '}
                    <Link
                      to="/login"
                      className="relative text-primary font-medium transition-all duration-200 hover:text-primary/90 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-primary/60 after:transition-all after:duration-300 hover:after:w-full"
                    >
                      {t('auth.signIn')}
                    </Link>
                  </p>
                </CardContent>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AuthLayout>
  );
}

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { registry } from '@/lib/module-registry';

// ─── Types ───────────────────────────────────────────────────────────────

interface ModuleErrorBoundaryProps {
  moduleId: string;
  children: ReactNode;
}

interface ModuleErrorBoundaryState {
  hasError: boolean;
}

// ─── Fallback UI (functional — can use hooks) ────────────────────────────

function ErrorFallback({
  moduleId,
  onReset,
}: {
  moduleId: string;
  onReset: () => void;
}) {
  const { t } = useTranslation();

  const mod = registry.getById(moduleId);
  const moduleLabel = mod ? t(mod.translationKey) : moduleId;

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12">
      <div className="glass-surface flex flex-col items-center gap-4 rounded-xl border border-border/40 p-8">
        <AlertTriangle className="h-10 w-10 text-destructive" strokeWidth={1.5} />

        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            {t('shell.errorBoundary.title')}
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {t('shell.errorBoundary.description')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            {moduleLabel}
          </p>
        </div>

        <Button variant="outline" size="default" onClick={onReset}>
          <RefreshCw className="h-4 w-4" />
          {t('shell.errorBoundary.reload')}
        </Button>
      </div>
    </div>
  );
}

// ─── Error Boundary (class — React 19 requirement) ──────────────────────

export class ModuleErrorBoundary extends Component<
  ModuleErrorBoundaryProps,
  ModuleErrorBoundaryState
> {
  constructor(props: ModuleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ModuleErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Module crash', {
      moduleId: this.props.moduleId,
      error,
      errorInfo,
    });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          moduleId={this.props.moduleId}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

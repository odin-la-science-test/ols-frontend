'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';
import { Search, X, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModuleLayout } from './module-layout';
import { ModuleHeader, type MobileMenuItem } from './module-header';
import { useDensity } from '@/hooks';


// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS LAYOUT - Reusable layout for settings/config pages
//
// Features:
// - Desktop: sidebar TOC with search + IntersectionObserver active highlight
// - Mobile: search bar + horizontal scrollable pills
// - Ctrl+F focuses the search input
// - Centered scrollable content area (density-aware)
//
// Used by: Settings, Profile, or any form-based page with sections
// ═══════════════════════════════════════════════════════════════════════════

export interface SettingsSection {
  id: string;
  icon: LucideIcon;
  labelKey: string;
  keywords?: string[];
}

interface SettingsLayoutProps {
  title: string;
  /** Lucide icon name in kebab-case for the mobile header */
  iconName: string;
  backTo?: string;
  sections: SettingsSection[];
  search?: boolean;
  toc?: boolean;
  maxWidth?: string;
  mobileMenuItems?: MobileMenuItem[];
  /** Render prop: receives filteredSectionIds (visible sections based on search) */
  children: ReactNode | ((filteredSectionIds: string[]) => ReactNode);
  className?: string;
}

export function SettingsLayout({
  title,
  iconName,
  backTo = '/',
  sections,
  search: showSearch = true,
  toc: showToc = true,
  maxWidth = 'max-w-2xl',
  mobileMenuItems,
  children,
  className,
}: SettingsLayoutProps) {
  const { t } = useTranslation();
  const d = useDensity();

  const [activeTocId, setActiveTocId] = useState<string>(sections[0]?.id ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter sections by search
  const filteredSectionIds = useMemo(() => {
    if (!searchQuery.trim()) return sections.map((s) => s.id);
    const q = searchQuery.toLowerCase();
    return sections
      .filter((s) => {
        const label = t(s.labelKey).toLowerCase();
        return label.includes(q) || (s.keywords?.some((kw) => kw.includes(q)) ?? false);
      })
      .map((s) => s.id);
  }, [searchQuery, sections, t]);

  // IntersectionObserver for active section tracking
  useEffect(() => {
    if (!showToc) return;
    const container = contentRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id);
          }
        }
      },
      { root: container, rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [filteredSectionIds, sections, showToc]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    const container = contentRef.current;
    if (el && container) {
      const elTop = el.getBoundingClientRect().top;
      const containerTop = container.getBoundingClientRect().top;
      container.scrollTo({ top: container.scrollTop + elTop - containerTop, behavior: 'smooth' });
    }
  }, []);

  // Ctrl+F focuses the search
  useEffect(() => {
    if (!showSearch) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showSearch]);

  const hasToc = showToc && sections.length > 0;
  const hasSearch = showSearch && sections.length > 0;

  return (
    <ModuleLayout>
      <ModuleHeader
        title={title}
        iconName={iconName}
        backTo={backTo}
        showFilters={false}
        mobileMenuItems={mobileMenuItems}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* ─── Desktop TOC sidebar ─── */}
        {hasToc && (
          <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 rounded-xl border border-border/30 bg-card m-3 overflow-hidden">
            {/* Search */}
            {hasSearch && (
              <div className="p-3 border-b border-border/20">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('settingsPage.searchPlaceholder')}
                    className="w-full pl-8 pr-8 py-1.5 text-xs rounded-md border border-border/40 bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted/50"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Section links */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {sections.map((section) => {
                const SectionIcon = section.icon;
                const isActive = activeTocId === section.id;
                const isVisible = filteredSectionIds.includes(section.id);

                if (!isVisible && searchQuery) return null;

                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group text-left',
                      isActive
                        ? 'bg-muted/50 text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    )}
                  >
                    <div className={cn(
                      'w-0.5 h-4 rounded-full shrink-0 transition-all duration-150',
                      isActive
                        ? 'system-indicator'
                        : 'bg-transparent group-hover:bg-muted-foreground/20'
                    )} />
                    <SectionIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1 truncate">{t(section.labelKey)}</span>
                    <ChevronRight className={cn(
                      'w-3 h-3 shrink-0 transition-all duration-150',
                      isActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-30'
                    )} />
                  </button>
                );
              })}
            </nav>

            {/* Search result count */}
            {searchQuery && (
              <div className="p-3 border-t border-border/20">
                <p className="text-[10px] text-muted-foreground/60 text-center">
                  {filteredSectionIds.length} / {sections.length} {t('settingsPage.sectionsVisible')}
                </p>
              </div>
            )}
          </aside>
        )}

        {/* ─── Main content ─── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile search bar + horizontal TOC */}
          {hasToc && (
            <div className="lg:hidden border-b border-border/20 space-y-0">
              {/* Mobile search */}
              {hasSearch && (
                <div className="px-3 pt-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('settingsPage.searchPlaceholder')}
                      className="w-full pl-8 pr-8 py-1.5 text-xs rounded-md border border-border/40 bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted/50"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Horizontal pills (mobile) */}
              <nav className="overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1 px-3 py-2 min-w-max">
                  {sections.map((section) => {
                    if (!filteredSectionIds.includes(section.id) && searchQuery) return null;
                    const SectionIcon = section.icon;
                    const isActive = activeTocId === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-150',
                          isActive
                            ? 'bg-muted/60 text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        )}
                      >
                        <SectionIcon className="w-3 h-3" />
                        {t(section.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>
          )}

          {/* Scrollable content area */}
          <div ref={contentRef} className={cn('flex-1 overflow-y-auto', className)}>
            <div className={cn(
              'mx-auto pb-20 lg:pb-8',
              maxWidth,
              d.density === 'compact' ? 'px-3 md:px-5 pt-3 space-y-3' : d.density === 'comfortable' ? 'px-6 md:px-10 pt-3 space-y-8' : 'px-4 md:px-8 pt-3 space-y-6'
            )}>
              {/* No results */}
              {searchQuery && filteredSectionIds.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Search className="w-8 h-8 mb-3 opacity-30" />
                  <p className="text-sm font-medium">{t('settingsPage.noResults')}</p>
                  <p className="text-xs mt-1 opacity-70">{t('settingsPage.noResultsDesc')}</p>
                </div>
              )}

              {typeof children === 'function' ? children(filteredSectionIds) : children}
            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}

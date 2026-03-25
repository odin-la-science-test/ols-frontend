import type { ReactNode } from 'react';

export type MenuId = 'atlas' | 'lab' | 'module' | 'module-split' | 'view' | 'help';

export interface MenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
  accentColor?: string | null;
}

export interface MenuSubMenuProps {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
}

export interface MenuTriggerProps {
  id: MenuId;
  icon?: ReactNode;
  /** Override the default i18n label */
  label?: string;
  accentColor?: string | null;
  isOpen: boolean;
  isCompact: boolean;
  onToggle: (id: MenuId) => void;
  onHover: (id: MenuId) => void;
}

export interface MenuDropdownProps {
  anchorId: MenuId;
  children: ReactNode;
}

export interface PlatformMenuContentProps {
  type: import('@/api').ModuleType;
  accentColor: string;
  onClose: () => void;
}

export interface OnCloseProps {
  onClose: () => void;
}

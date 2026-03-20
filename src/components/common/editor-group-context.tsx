'use client';

import * as React from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// EDITOR GROUP CONTEXT
//
// Tells a module which editor group it's rendered in ('main' or 'split').
// The SplitEditorPane wraps its children with groupId='split'.
// The main content area uses the default 'main'.
// module-page-template reads this to register filters/detail in the right group.
// ═══════════════════════════════════════════════════════════════════════════

const EditorGroupContext = React.createContext<string>('main');

export function EditorGroupProvider({
  groupId,
  children,
}: {
  groupId: string;
  children: React.ReactNode;
}) {
  return (
    <EditorGroupContext.Provider value={groupId}>
      {children}
    </EditorGroupContext.Provider>
  );
}

export function useEditorGroupId(): string {
  return React.useContext(EditorGroupContext);
}

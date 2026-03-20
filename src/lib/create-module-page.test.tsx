import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createModulePage } from './create-module-page';
import type { ModulePageConfig } from './create-module-page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('@/stores', () => ({
  useWorkspaceStore: (selector: (state: { addRecent: () => void }) => unknown) => {
    const state = {
      addRecent: vi.fn(),
    };
    return selector ? selector(state) : state;
  },
  useTabsStore: (selector: (state: { addTab: () => void }) => unknown) => {
    const state = {
      addTab: vi.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock('./module-icons', () => ({
  getModuleIcon: (name: string) => name,
}));

vi.mock('@/components/modules/shared', () => ({
  ModulePageTemplate: ({ title }: { title: string }) => <div data-testid="module-page">{title}</div>,
}));

// Test entity type
interface TestEntity {
  id: number;
  name: string;
}

// Helper to create a test config
function createTestConfig(
  withHook: boolean,
  hookReturnValue?: unknown[]
): ModulePageConfig<TestEntity, unknown> {
  return {
    translations: () => ({
      title: withHook ? 'Module With Hook' : 'Module Without Hook',
      searchPlaceholder: 'Search...',
      loading: 'Loading...',
      error: 'Error',
      errorDesc: 'Error description',
      emptyTitle: 'Empty',
      emptyDatabase: 'No data',
      searchNoResults: (query: string) => `No results for ${query}`,
      filterNoMatch: 'No match',
    }),
    accentColor: 'hsl(200, 70%, 50%)',
    iconName: 'test-icon',
    useData: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }),
    filters: [],
    getColumns: () => [],
    computeStats: () => [],
    DetailComponent: () => <div>Detail</div>,
    detailItemKey: 'item',
    // Conditionally add useMobileMenuItems hook
    ...(withHook && {
      useMobileMenuItems: () => hookReturnValue || [],
    }),
  };
}

// Wrapper component for tests
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('createModulePage - Bug Condition Exploration', () => {
  /**
   * Property 1: Bug Condition - Consistent Hook Call Order
   * 
   * This test explores the bug condition where navigating between modules
   * with different hook configurations causes React error #300.
   * 
   * EXPECTED RESULT ON UNFIXED CODE: This test SHOULD FAIL
   * The failure confirms the bug exists.
   * 
   * Requirements: 1.1, 1.2, 1.3, 1.4
   */
  
  it('should maintain consistent hook call order when rendering module with useMobileMenuItems', () => {
    // Test Case 1: Render module WITH useMobileMenuItems hook
    const ConfigWithHook = createTestConfig(true, [{ label: 'Test Item', onClick: vi.fn() }]);
    const ModuleWithHook = createModulePage(ConfigWithHook);
    
    const { unmount } = render(
      <TestWrapper>
        <ModuleWithHook />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('module-page')).toHaveTextContent('Module With Hook');
    unmount();
  });

  it('should maintain consistent hook call order when rendering module without useMobileMenuItems', () => {
    // Test Case 2: Render module WITHOUT useMobileMenuItems hook
    const ConfigWithoutHook = createTestConfig(false);
    const ModuleWithoutHook = createModulePage(ConfigWithoutHook);
    
    const { unmount } = render(
      <TestWrapper>
        <ModuleWithoutHook />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('module-page')).toHaveTextContent('Module Without Hook');
    unmount();
  });

  it('should NOT throw React hook error when navigating from module with hook to module without hook', () => {
    // Test Case 3: Simulate navigation - WITH hook → WITHOUT hook
    // This simulates: Bacteriology (with useBacteriologyPanel) → Mycology (without hook)
    
    const ConfigWithHook = createTestConfig(true, [{ label: 'Panel Item', onClick: vi.fn() }]);
    const ConfigWithoutHook = createTestConfig(false);
    
    const ModuleWithHook = createModulePage(ConfigWithHook);
    const ModuleWithoutHook = createModulePage(ConfigWithoutHook);
    
    // First render: module WITH hook
    const { unmount: unmount1 } = render(
      <TestWrapper>
        <ModuleWithHook />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('module-page')).toHaveTextContent('Module With Hook');
    unmount1();
    
    // Second render: module WITHOUT hook (simulates navigation)
    // EXPECTED ON UNFIXED CODE: This will throw React error #300
    // "Rendered fewer hooks than expected"
    const { unmount: unmount2 } = render(
      <TestWrapper>
        <ModuleWithoutHook />
      </TestWrapper>
    );
    
    // This assertion validates the expected behavior (Requirements 2.3, 2.4)
    expect(screen.getByTestId('module-page')).toHaveTextContent('Module Without Hook');
    unmount2();
  });

  it('should NOT throw React hook error when navigating from module without hook to module with hook', () => {
    // Test Case 4: Simulate navigation - WITHOUT hook → WITH hook
    // This simulates: Mycology (without hook) → Bacteriology (with useBacteriologyPanel)
    
    const ConfigWithoutHook = createTestConfig(false);
    const ConfigWithHook = createTestConfig(true, [{ label: 'Panel Item', onClick: vi.fn() }]);
    
    const ModuleWithoutHook = createModulePage(ConfigWithoutHook);
    const ModuleWithHook = createModulePage(ConfigWithHook);
    
    // First render: module WITHOUT hook
    const { unmount: unmount1 } = render(
      <TestWrapper>
        <ModuleWithoutHook />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('module-page')).toHaveTextContent('Module Without Hook');
    unmount1();
    
    // Second render: module WITH hook (simulates navigation)
    // EXPECTED ON UNFIXED CODE: This will throw React error #300
    // "Rendered more hooks than expected"
    const { unmount: unmount2 } = render(
      <TestWrapper>
        <ModuleWithHook />
      </TestWrapper>
    );
    
    // This assertion validates the expected behavior (Requirements 2.3, 2.4)
    expect(screen.getByTestId('module-page')).toHaveTextContent('Module With Hook');
    unmount2();
  });

  it('should NOT throw React hook error during multiple navigations between different module types', () => {
    // Test Case 5: Multiple navigations
    // Simulates: Bacteriology → Mycology → Bacteriology → Mycology
    
    const ConfigWithHook = createTestConfig(true, [{ label: 'Panel', onClick: vi.fn() }]);
    const ConfigWithoutHook = createTestConfig(false);
    
    const ModuleWithHook = createModulePage(ConfigWithHook);
    const ModuleWithoutHook = createModulePage(ConfigWithoutHook);
    
    // Navigation 1: WITH hook
    const { unmount: unmount1 } = render(
      <TestWrapper>
        <ModuleWithHook />
      </TestWrapper>
    );
    expect(screen.getByTestId('module-page')).toHaveTextContent('Module With Hook');
    unmount1();
    
    // Navigation 2: WITHOUT hook
    const { unmount: unmount2 } = render(
      <TestWrapper>
        <ModuleWithoutHook />
      </TestWrapper>
    );
    expect(screen.getByTestId('module-page')).toHaveTextContent('Module Without Hook');
    unmount2();
    
    // Navigation 3: WITH hook again
    const { unmount: unmount3 } = render(
      <TestWrapper>
        <ModuleWithHook />
      </TestWrapper>
    );
    expect(screen.getByTestId('module-page')).toHaveTextContent('Module With Hook');
    unmount3();
    
    // Navigation 4: WITHOUT hook again
    // EXPECTED ON UNFIXED CODE: React error #300 may occur at any navigation
    const { unmount: unmount4 } = render(
      <TestWrapper>
        <ModuleWithoutHook />
      </TestWrapper>
    );
    expect(screen.getByTestId('module-page')).toHaveTextContent('Module Without Hook');
    unmount4();
  });
});

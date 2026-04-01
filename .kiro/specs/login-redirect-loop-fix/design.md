# Login Redirect Loop Fix - Bugfix Design

## Overview

Le bug de boucle de redirection après login est causé par un problème de synchronisation entre la mise à jour du store Zustand (setAuth) et la navigation React Router. Lorsque `setAuth(user)` est appelé suivi immédiatement de `navigate(from)`, le composant `ProtectedRoute` évalue `isAuthenticated` avant que le middleware `persist` de Zustand n'ait terminé la synchronisation de l'état. Cela provoque une redirection vers `/login` au lieu de la destination prévue.

La solution consiste à garantir que l'état d'authentification est complètement synchronisé avant d'effectuer la navigation, en utilisant soit une approche synchrone avec `flushSync`, soit une approche asynchrone avec un callback de confirmation.

## Glossary

- **Bug_Condition (C)**: La condition qui déclenche le bug - quand setAuth() est appelé et navigate() est exécuté avant que isAuthenticated soit true
- **Property (P)**: Le comportement désiré - isAuthenticated doit être true avant que la navigation vers une route protégée ne se produise
- **Preservation**: Les comportements existants de logout, validation de session, et redirection des utilisateurs non-authentifiés qui doivent rester inchangés
- **setAuth**: La fonction dans `src/stores/auth-store.ts` qui met à jour l'état d'authentification (user et isAuthenticated)
- **navigate**: La fonction React Router qui effectue la navigation programmatique
- **ProtectedRoute**: Le composant dans `src/components/common/protected-route.tsx` qui vérifie isAuthenticated avant de rendre les routes protégées
- **persist middleware**: Le middleware Zustand qui synchronise l'état du store avec le localStorage de manière asynchrone
- **Race condition**: Situation où navigate() s'exécute avant que persist middleware n'ait mis à jour isAuthenticated

## Bug Details

### Bug Condition

Le bug se manifeste lorsqu'un utilisateur se connecte avec succès (login, register, ou guest login) et que la fonction `navigate(from)` est appelée immédiatement après `setAuth(user)`. Le middleware `persist` de Zustand effectue une synchronisation asynchrone, ce qui signifie que `isAuthenticated` peut encore être `false` au moment où `ProtectedRoute` effectue sa vérification.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { setAuthCalled: boolean, navigateCalled: boolean, isAuthenticatedValue: boolean, timestamp: number }
  OUTPUT: boolean
  
  RETURN input.setAuthCalled == true
         AND input.navigateCalled == true
         AND input.isAuthenticatedValue == false
         AND input.timestamp < persistMiddlewareSyncTime
END FUNCTION
```

### Examples

- **Login Success**: User logs in with valid credentials → setAuth(user) is called → navigate('/') is called immediately → ProtectedRoute checks isAuthenticated (still false) → redirects to /login → infinite loop
- **Register Success**: User registers a new account → setAuth(user) is called → navigate('/') is called immediately → ProtectedRoute checks isAuthenticated (still false) → redirects to /login → infinite loop
- **Guest Login**: User clicks guest login → setAuth(user) is called → navigate('/') is called immediately → ProtectedRoute checks isAuthenticated (still false) → redirects to /login → infinite loop
- **Edge Case - Slow Storage**: On devices with slow localStorage access, the persist middleware takes longer to sync, increasing the likelihood of the race condition

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Non-authenticated users attempting to access protected routes must continue to be redirected to /login with the from location preserved
- Logout functionality must continue to clear authentication state and redirect to /login
- Session validation on app startup (authApi.me()) must continue to work correctly
- Registration flow must continue to authenticate and redirect properly
- Guest login flow must continue to authenticate and redirect properly

**Scope:**
All inputs that do NOT involve the login success flow (setAuth followed by navigate) should be completely unaffected by this fix. This includes:
- Direct navigation by non-authenticated users
- Logout operations
- Session restoration on app startup
- Any other authentication state changes that don't involve immediate navigation

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Asynchronous Persist Middleware**: The Zustand persist middleware synchronizes state to localStorage asynchronously. When `setAuth(user)` is called, it updates the in-memory state immediately but the persist middleware may not have completed writing to storage before `navigate()` is executed.

2. **React Router Navigation Timing**: When `navigate(from)` is called, React Router immediately triggers a re-render of the target route. The `ProtectedRoute` component reads `isAuthenticated` from the Zustand store, but if the persist middleware hasn't finished, the value may still be the old (false) value.

3. **State Subscription Race**: The `useAuthStore` hook in `ProtectedRoute` subscribes to the store state. If navigation happens before the store notifies subscribers of the state change, `ProtectedRoute` will read the stale value.

4. **No Synchronization Guarantee**: The current implementation in `use-auth.ts` has no mechanism to ensure that `isAuthenticated` is true before calling `navigate()`. The code assumes synchronous state updates, but Zustand with persist middleware is asynchronous.

## Correctness Properties

Property 1: Bug Condition - Authentication State Synchronized Before Navigation

_For any_ login success event (login, register, or guest login) where setAuth(user) is called followed by navigate(from), the system SHALL ensure that isAuthenticated is true in the Zustand store before the navigate() function is executed, preventing ProtectedRoute from evaluating isAuthenticated as false.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Non-Login Navigation Behavior

_For any_ navigation event that is NOT part of a login success flow (logout, direct navigation by non-authenticated users, session restoration), the system SHALL produce exactly the same behavior as the original code, preserving all existing authentication checks, redirections, and state management.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/hooks/use-auth.ts`

**Function**: `useLoginSuccess` (and similar logic in `useGuestLogin` and `useRegister`)

**Specific Changes**:

1. **Option A - Synchronous Approach with flushSync**: Use React's `flushSync` to force synchronous state updates before navigation
   - Import `flushSync` from 'react-dom'
   - Wrap `setAuth(user)` in `flushSync(() => setAuth(user))`
   - This ensures React processes the state update immediately before continuing

2. **Option B - Callback Approach**: Add a callback mechanism to `setAuth` that fires when persist middleware completes
   - Modify `auth-store.ts` to expose an `onAuthChange` callback
   - Call `navigate()` inside the callback to ensure synchronization is complete

3. **Option C - Polling Approach**: Poll `isAuthenticated` until it becomes true before navigating
   - After calling `setAuth(user)`, check `useAuthStore.getState().isAuthenticated` in a loop
   - Use `setTimeout` or `requestAnimationFrame` to poll until true
   - Add timeout to prevent infinite loops

4. **Option D - State Subscription**: Subscribe to store changes and navigate only when `isAuthenticated` becomes true
   - Use Zustand's `subscribe` API to listen for state changes
   - Navigate when `isAuthenticated` transitions from false to true
   - Unsubscribe after navigation to prevent memory leaks

5. **Recommended Solution - Option A (flushSync)**: This is the simplest and most reliable approach
   - Minimal code changes
   - No additional complexity or async logic
   - Forces synchronous execution, eliminating the race condition
   - Works with existing Zustand persist middleware

### Implementation Details for Option A (Recommended)

```typescript
import { flushSync } from 'react-dom';

const useLoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  return async (response: AxiosResponse<AuthResponse>) => {
    const { user } = response.data;
    
    // Force synchronous state update
    flushSync(() => {
      setAuth(user);
    });
    
    queryClient.invalidateQueries({ queryKey: ['modules'] });
    await syncOnLogin();
    initPreferencesSync();
    navigate(from, { replace: true });
  };
};
```

Apply the same pattern to `useGuestLogin` and `useRegister`.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code by simulating the race condition, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate login success followed by immediate navigation, with mocked slow persist middleware to exacerbate the race condition. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Login Race Condition Test**: Mock authApi.login to return success, call login mutation, verify that navigate is called before isAuthenticated becomes true (will fail on unfixed code)
2. **Register Race Condition Test**: Mock authApi.register to return success, call register mutation, verify that navigate is called before isAuthenticated becomes true (will fail on unfixed code)
3. **Guest Login Race Condition Test**: Mock authApi.guest to return success, call guest mutation, verify that navigate is called before isAuthenticated becomes true (will fail on unfixed code)
4. **Slow Storage Test**: Mock localStorage with artificial delay, perform login, verify that ProtectedRoute redirects to /login instead of rendering protected content (will fail on unfixed code)

**Expected Counterexamples**:
- navigate() is called while isAuthenticated is still false
- ProtectedRoute redirects to /login immediately after successful login
- Possible causes: asynchronous persist middleware, no synchronization between setAuth and navigate, React Router navigation timing

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (login success events), the fixed function ensures isAuthenticated is true before navigation.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := loginSuccess_fixed(input)
  ASSERT isAuthenticated == true BEFORE navigate() is called
  ASSERT ProtectedRoute renders protected content (not redirect)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (non-login navigation), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT loginSuccess_original(input) = loginSuccess_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for logout, session validation, and non-authenticated navigation, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Logout Preservation**: Verify that logout continues to clear auth state and redirect to /login
2. **Session Validation Preservation**: Verify that authApi.me() on app startup continues to work correctly
3. **Non-Authenticated Navigation Preservation**: Verify that non-authenticated users are still redirected to /login with from location preserved
4. **Registration Flow Preservation**: Verify that registration continues to work (with the fix applied)
5. **Guest Login Flow Preservation**: Verify that guest login continues to work (with the fix applied)

### Unit Tests

- Test that setAuth updates isAuthenticated synchronously when wrapped in flushSync
- Test that navigate is called only after isAuthenticated is true
- Test that ProtectedRoute renders protected content after successful login
- Test edge cases (network errors, invalid credentials, missing from location)

### Property-Based Tests

- Generate random user objects and verify that login success always results in isAuthenticated being true before navigation
- Generate random from locations and verify that navigation always goes to the correct destination
- Test that all non-login navigation scenarios continue to work across many random inputs

### Integration Tests

- Test full login flow: enter credentials → submit → verify redirect to intended destination
- Test full registration flow: enter user data → submit → verify redirect to intended destination
- Test full guest login flow: click guest button → verify redirect to home page
- Test that protected routes are accessible after successful login
- Test that logout works correctly and redirects to login page

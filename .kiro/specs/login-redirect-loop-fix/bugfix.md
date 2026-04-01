# Bugfix Requirements Document

## Introduction

Après une connexion réussie, l'utilisateur est redirigé vers la page de login au lieu d'accéder au site. Ce bug empêche les utilisateurs de se connecter et d'utiliser l'application, créant une boucle de redirection infinie. Le problème suggère un problème de synchronisation entre la mise à jour du store d'authentification (setAuth) et la vérification de l'état d'authentification (isAuthenticated) lors de la navigation.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user successfully logs in with valid credentials THEN the system redirects to the login page instead of the intended destination

1.2 WHEN the authentication state is updated via setAuth(user) and navigation occurs immediately THEN the ProtectedRoute component evaluates isAuthenticated as false

1.3 WHEN the Zustand persist middleware has not yet synchronized the authentication state to storage THEN the navigation to a protected route fails the authentication check

### Expected Behavior (Correct)

2.1 WHEN a user successfully logs in with valid credentials THEN the system SHALL redirect to the intended destination (from parameter or home page)

2.2 WHEN the authentication state is updated via setAuth(user) THEN the system SHALL ensure isAuthenticated is true before navigation occurs

2.3 WHEN navigating to a protected route after login THEN the ProtectedRoute component SHALL recognize the user as authenticated

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a non-authenticated user attempts to access a protected route THEN the system SHALL CONTINUE TO redirect to the login page with the from location preserved

3.2 WHEN a user logs out THEN the system SHALL CONTINUE TO clear the authentication state and redirect to the login page

3.3 WHEN the application starts with a valid persisted session THEN the system SHALL CONTINUE TO validate the session via authApi.me() and restore the authentication state

3.4 WHEN a user successfully registers a new account THEN the system SHALL CONTINUE TO authenticate and redirect to the intended destination

3.5 WHEN a guest user logs in THEN the system SHALL CONTINUE TO authenticate and redirect to the intended destination

# App Layout Implementation Plan

## 1. Overview

The App Layout provides a consistent structural wrapper for the entire application, featuring a top navigation bar for branding, navigation links, and user actions. It ensures a consistent user experience across all pages while supporting responsive design for both desktop and mobile devices.

## 2. Layout Routing

This is a base layout that will encapsulate all authenticated application routes.

## 3. Component Structure

```
AppLayout
├── Header
│   ├── Logo/Brand
│   ├── DesktopNavigation
│   │   └── NavItems
│   ├── UserMenu
│   │   └── LogoutButton
│   └── MobileMenuToggle
├── MobileNavigation (shown when toggled)
│   ├── NavItems
│   └── LogoutButton
└── Content Area (children)
```

## 4. Component Details

### AppLayout

- **Description**: Root layout component that wraps the application's authenticated pages
- **Main elements**: Header component, mobile navigation, and content area
- **Supported interactions**: None directly
- **Types**: AppLayoutProps
- **Props**: children

### Header

- **Description**: Top navigation bar containing brand, navigation links, and user menu
- **Main elements**: Logo/brand, desktop navigation, user menu, mobile menu toggle
- **Supported interactions**: None directly
- **Types**: HeaderProps
- **Props**: user, currentPath

### DesktopNavigation

- **Description**: Horizontal navigation menu for desktop view
- **Main elements**: Navigation links with proper active states
- **Supported interactions**: Navigation to different app sections
- **Types**: NavigationProps
- **Props**: items, currentPath

### UserMenu

- **Description**: Dropdown menu showing user info and actions
- **Main elements**: User avatar/name, logout button
- **Supported interactions**: Toggle dropdown, logout
- **Supported validation**: Ensures user is authenticated
- **Types**: UserMenuProps
- **Props**: user, onLogout

### LogoutButton

- **Description**: Button to trigger user logout
- **Main elements**: Button with text and icon
- **Supported interactions**: Click to logout
- **Types**: LogoutButtonProps
- **Props**: onLogout

### MobileMenuToggle

- **Description**: Button to show/hide mobile navigation menu
- **Main elements**: Hamburger icon button
- **Supported interactions**: Toggle mobile menu visibility
- **Types**: MobileMenuToggleProps
- **Props**: isOpen, onToggle

### MobileNavigation

- **Description**: Slide-out/dropdown navigation for mobile devices
- **Main elements**: Navigation links, logout button
- **Supported interactions**: Navigation, logout, close menu
- **Types**: MobileNavigationProps
- **Props**: items, currentPath, isOpen, onClose, user, onLogout

## 5. Types

```typescript
// User authentication types
interface User {
  id: string;
  email: string;
  name?: string;
}

// Navigation types
interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

// Component props
interface AppLayoutProps {
  children: React.ReactNode;
}

interface HeaderProps {
  user: User | null;
  currentPath: string;
}

interface NavigationProps {
  items: NavigationItem[];
  currentPath: string;
}

interface UserMenuProps {
  user: User;
  onLogout: () => Promise<void>;
}

interface LogoutButtonProps {
  onLogout: () => Promise<void>;
}

interface MobileMenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MobileNavigationProps {
  items: NavigationItem[];
  currentPath: string;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => Promise<void>;
}
```

## 6. State Management

### Authentication State

We'll use a custom `useAuth` hook to manage authentication:

```typescript
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with Supabase auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { user, isLoading, logout };
};
```

### Mobile Menu State

Use a simple useState hook in the AppLayout:

```typescript
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
const closeMobileMenu = () => setIsMobileMenuOpen(false);
```

## 7. API Integration

### Authentication

We'll use Supabase authentication APIs:

```typescript
// Logout function
const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
    // Redirect to login page after successful logout
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed:", error);
    // Show error notification
  }
};
```

## 8. User Interactions

### Navigation

- Clicking on navigation items navigates to the corresponding route
- Active route is highlighted visually
- Navigation items are accessible via keyboard (for desktop)

### User Menu

- Clicking on user avatar opens dropdown menu
- Menu contains user info and logout button
- Clicking outside the menu closes it

### Mobile Menu

- Hamburger icon toggle shows/hides mobile navigation
- Swiping from edge could also open menu (optional enhancement)
- Clicking on nav item navigates and closes menu
- Clicking outside menu area closes menu

### Logout

- Clicking logout button triggers logout API call
- On successful logout, user is redirected to login page
- During logout process, show loading indicator

## 9. Conditions and Validation

### Authentication Check

- AppLayout should only be accessible to authenticated users
- If authentication check fails, redirect to login page
- This can be handled by a route guard or similar mechanism

### Active Route Highlighting

- Compare current path with navigation item paths
- Apply appropriate styling to active item
- Consider partial matching for nested routes

## 10. Error Handling

### Authentication Errors

- If logout fails, display error message and provide retry option
- If authentication state is lost unexpectedly, redirect to login page

### Navigation Errors

- If a route doesn't exist, provide proper error handling via router

## 11. Implementation Steps

1. **Create folder structure**

   - Create `src/shared/components/layout/AppLayout` directory
   - Create `src/shared/hooks/useAuth.ts` file

2. **Implement authentication hook**

   - Create `useAuth` hook with Supabase integration
   - Implement logout functionality

3. **Create base AppLayout component**

   - Set up basic structure with header and content area
   - Implement responsive container

4. **Implement Header component**

   - Create logo/brand area
   - Add desktop navigation
   - Add user menu area
   - Add mobile menu toggle

5. **Implement navigation components**

   - Create DesktopNavigation with NavItems
   - Implement active state highlighting
   - Ensure proper accessibility attributes

6. **Implement UserMenu component**

   - Create dropdown with user info
   - Add logout button
   - Implement dropdown toggle functionality

7. **Implement mobile navigation**

   - Create MobileNavigation component
   - Add slide-in/out animation
   - Ensure it contains same navigation items as desktop
   - Add logout button

8. **Connect authentication**

   - Integrate useAuth hook with main layout
   - Implement redirect on logout
   - Add loading states

9. **Add responsive styles**

   - Implement Tailwind responsive classes
   - Test on different screen sizes
   - Ensure touch targets are appropriate size

10. **Add ARIA attributes and accessibility features**

    - Ensure proper ARIA roles and states
    - Test keyboard navigation
    - Verify color contrast

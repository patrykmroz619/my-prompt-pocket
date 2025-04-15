import React from "react";
import { MenuIcon, Library, PlusCircle } from "lucide-react";
import { useAuth } from "@shared/hooks/useAuth";
import { cn } from "@shared/utils";
import { Button } from "@shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@shared/components/ui/sheet";
import { Menubar, MenubarMenu, MenubarTrigger } from "@shared/components/ui/menubar";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Toaster } from "@shared/components/ui/sonner";
import { UserMenu } from "./UserMenu";

export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface MainLayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

const navigationItems: NavigationItem[] = [
  { label: "Prompts Library", href: "/prompts", icon: <Library className="size-4" /> },
  { label: "Create Prompt", href: "/prompts/create", icon: <PlusCircle className="size-4" /> },
];

export function MainLayout({ children, currentPath }: MainLayoutProps) {
  const { user, isLoading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95">
          <div className="container flex h-14 items-center">
            <div className="mr-4 flex items-center space-x-2">
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="hidden md:flex space-x-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex-1 flex justify-end">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </header>
        <main className="container py-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </main>
      </div>
    );
  }

  // if (!user) {
  //   typeof window !== "undefined" && (window.location.href = "/login");
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center space-x-2">
            <a href="/" className="flex items-center space-x-2">
              <span className="font-bold">MyPromptPocket</span>
            </a>
          </div>

          <Menubar className="hidden md:flex">
            {navigationItems.map((item) => (
              <MenubarMenu key={item.href}>
                <MenubarTrigger
                  className={cn(
                    "flex items-center gap-2",
                    currentPath === item.href && "bg-accent text-accent-foreground"
                  )}
                  asChild
                >
                  <a href={item.href}>
                    {item.icon}
                    {item.label}
                  </a>
                </MenubarTrigger>
              </MenubarMenu>
            ))}
          </Menubar>

          <div className="flex flex-1 items-center justify-end space-x-4">
            <UserMenu user={user || { id: "user", email: "user@mail.com" }} onLogout={logout} />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MenuIcon className="size-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-4">
                  {navigationItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 text-sm font-medium",
                        currentPath === item.href ? "text-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container py-6">{children}</main>
      <Toaster position="bottom-right" />
    </div>
  );
}

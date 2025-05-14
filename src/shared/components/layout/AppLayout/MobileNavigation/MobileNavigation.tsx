import { MenuIcon, User2, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";
import { Button } from "@shared/components/ui/button";
import { Avatar, AvatarFallback } from "@shared/components/ui/avatar";
import { navigationItems } from "../navigationItems";
import type { IUser } from "@shared/types/types";

interface MobileNavigationProps {
  userData: IUser;
}

export function MobileNavigation({ userData }: MobileNavigationProps) {
  const initials = userData.email ? userData.email.substring(0, 2).toUpperCase() : "U";

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        window.location.href = "/auth/login";
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden z-50">
            <MenuIcon className="size-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg">
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-xs">{userData.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {navigationItems.map((item) => (
            <DropdownMenuItem key={item.href}>
              <a href={item.href} className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </a>
            </DropdownMenuItem>
          ))}

          <DropdownMenuItem>
            <a href="/account" className="flex items-center gap-2">
              <User2 />
              Account
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} color="red">
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

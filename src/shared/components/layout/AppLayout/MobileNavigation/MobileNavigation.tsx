import { useState } from "react";
import { Library, PlusCircle, MenuIcon, User2, LogOut, Plus, LibraryIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";
import { Button } from "@shared/components/ui/button";
import { useAuth } from "@shared/hooks/useAuth";
import { Avatar, AvatarFallback } from "@shared/components/ui/avatar";
import { navigationItems } from "../navigationItems";

interface MobileNavigationProps {
  currentPath: string;
}

export function MobileNavigation({ currentPath }: MobileNavigationProps) {
  let { user, logout } = useAuth();

  user ||= { id: "id", email: "user@mail.com" };

  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "U";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
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
                {/* <span className="truncate font-semibold">User</span> */}
                <span className="truncate text-xs">{user.email}</span>
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

          <DropdownMenuItem disabled>
            <User2 />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout} color="red">
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

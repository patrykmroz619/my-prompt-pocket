import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@shared/components/ui/navigation-menu";
import { navigationItems } from "../navigationItems";

export interface MainNavigationProps {
  currentPath: string;
}

export function MainNavigation(props: MainNavigationProps) {
  const { currentPath } = props;

  return (
    <NavigationMenu className="hidden md:flex ">
      <NavigationMenuList>
        {navigationItems.map((item) => (
          <NavigationMenuItem
            key={item.href}
            className={currentPath === item.href ? "bg-accent text-accent-foreground" : ""}
          >
            <NavigationMenuLink href={item.href} className="flex flex-row text-nowrap items-center space-x-2">
              {item.label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

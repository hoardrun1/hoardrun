import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Cards", href: "/cards" },
  { name: "Send Money", href: "/send-money" },
  { name: "Receive Money", href: "/receive-money" },
  { name: "Investments", href: "/investments" },
  { name: "Savings", href: "/savings" },
  { name: "Settings", href: "/settings" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-[#1a1b1f] border-b border-gray-800">
      <div className="flex items-center space-x-8">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent">
          HoardRun
        </Link>
        
        <div className="hidden md:flex space-x-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? "text-gray-400 font-medium bg-[#2c2d33]"
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#2c2d33]"
                } px-3 py-2 rounded-md text-sm transition-colors`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-gray-400" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#2c2d33] border-gray-700">
            <DropdownMenuItem className="text-gray-200 hover:bg-gray-700">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-gray-200 hover:bg-gray-700">Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-gray-200 hover:bg-gray-700">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

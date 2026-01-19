import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconUser, IconLogout, IconMenu2 } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useEffect, useState } from "react";

export function Header() {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth();
  const { toggled, setToggled } = useSidebarContext();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setToggled(!toggled);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        {/* Logo and Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-1"
              aria-label="Toggle menu"
            >
              <IconMenu2 className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-base sm:text-lg">O</span>
            </div>
            <span className="font-semibold text-base sm:text-lg whitespace-nowrap">
              <span className="hidden sm:inline">OFSP Marketplace</span>
              <span className="sm:hidden">OFSP</span>
            </span>
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {isAuthenticated && user && (
            <>
              <div className="flex items-center gap-2 mr-1 sm:mr-2">
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">{user.name}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10" title="Profile">
                <IconUser className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 sm:h-10 sm:w-10"
                title="Logout"
              >
                <IconLogout className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <Link to="/login">
              <Button variant="default" size="sm" className="text-xs sm:text-sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

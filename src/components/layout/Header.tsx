import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconMenu2 } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useEffect, useState } from "react";

export function Header() {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth();
  const { toggled, setToggled } = useSidebarContext();
  const [isMobile, setIsMobile] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

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
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && user && (
            <>
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm font-medium"
                onClick={() => navigate("/dashboard/profile")}
              >
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm font-medium"
                onClick={() => setShowSignOutDialog(true)}
              >
                Sign Out
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

      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}

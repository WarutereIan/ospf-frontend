import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconUser, IconLogout } from "@tabler/icons-react";
import { useUserRole } from "@/contexts/UserRoleContext";

export function Header() {
  const navigate = useNavigate();
  const { setRole, setUserId, role } = useUserRole();

  const handleLogout = () => {
    setRole(null);
    setUserId(null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">O</span>
            </div>
            <span className="font-semibold text-lg">OFSP Marketplace</span>
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {role && (
            <>
              <Button variant="ghost" size="icon" title="Profile">
                <IconUser className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <IconLogout className="h-5 w-5" />
              </Button>
            </>
          )}
          {!role && (
            <Link to="/login">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

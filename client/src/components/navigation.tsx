import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCurrentUser, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, Trophy, Users, Settings, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Navigation() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/me"],
    queryFn: getCurrentUser,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log out",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-[var(--cyber-card)] border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Flag className="text-[var(--cyber-green)] h-6 w-6" />
              <span className="text-xl font-bold text-[var(--cyber-green)]">SkelerSecurity</span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link href="/" className={`transition-colors ${location === "/" ? "text-[var(--cyber-blue)]" : "text-[var(--cyber-gray)] hover:text-white"}`}>
                Challenges
              </Link>
              <Link href="/leaderboard" className={`transition-colors ${location === "/leaderboard" ? "text-[var(--cyber-blue)]" : "text-[var(--cyber-gray)] hover:text-white"}`}>
                Leaderboard
              </Link>
              {user?.isAdmin && (
                <Link href="/admin" className={`transition-colors ${location === "/admin" ? "text-[var(--cyber-blue)]" : "text-[var(--cyber-gray)] hover:text-white"}`}>
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-sm text-[var(--cyber-gray)]">
                <span>Team: {user.name}</span>
                {stats && (
                  <Badge variant="secondary" className="ml-2 bg-[var(--cyber-green)] text-black">
                    {stats.points} pts
                  </Badge>
                )}
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [, navigate] = useLocation();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/me"],
    queryFn: getCurrentUser,
    retry: 1, // Allow one retry
    retryDelay: 500, // Wait 500ms before retry
  });

  useEffect(() => {
    // Only redirect to login if we have a clear authentication error
    if (error && error.message && error.message.includes("401")) {
      console.log("Authentication failed, redirecting to login:", error.message);
      navigate("/login");
    }
  }, [error, navigate]);

  useEffect(() => {
    if (user && requireAdmin && !user.isAdmin) {
      navigate("/");
    }
  }, [user, requireAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (requireAdmin && !user?.isAdmin) {
    return null;
  }

  return <>{children}</>;
}

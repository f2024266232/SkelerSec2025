import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Flag } from "lucide-react";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: () => login(name, password),
    onSuccess: (data) => {
      toast({
        title: "Welcome!",
        description: `Successfully logged in as ${data.name}`,
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[var(--cyber-dark)] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <Flag className="h-8 w-8 text-[var(--cyber-green)]" />
            <h1 className="text-3xl font-bold text-[var(--cyber-green)]">SkelerSecurity</h1>
          </div>
          <h2 className="text-2xl font-bold text-white">Team Login</h2>
          <p className="mt-2 text-[var(--cyber-gray)]">
            Enter your team credentials to access the CTF
          </p>
        </div>

        <Card className="bg-[var(--cyber-card)] border-gray-700 shadow-[var(--cyber-card-shadow)]">
          <CardHeader>
            <CardTitle className="text-[var(--cyber-blue)]">Login to Your Team</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-[var(--cyber-gray)]">Team Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-[var(--cyber-blue)]"
                  placeholder="Enter your team name"
                  disabled={loginMutation.isPending}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-[var(--cyber-gray)]">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-[var(--cyber-blue)]"
                  placeholder="Enter your password"
                  disabled={loginMutation.isPending}
                />
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-[var(--cyber-blue)] hover:bg-blue-600 text-white font-bold"
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[var(--cyber-gray)]">
                Teams are created by administrators. Contact your CTF organizer to get team credentials.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-[var(--cyber-gray)]">
            Demo Admin Login: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { register } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Flag } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: () => register(name, password),
    onSuccess: (data) => {
      toast({
        title: "Team Created!",
        description: `Successfully registered team ${data.name}`,
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create team",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !password.trim() || !confirmPassword.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[var(--cyber-dark)] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <Flag className="h-8 w-8 text-[var(--cyber-green)]" />
            <h1 className="text-3xl font-bold text-[var(--cyber-green)]">CyberArena</h1>
          </div>
          <h2 className="text-2xl font-bold text-white">Team Registration</h2>
          <p className="mt-2 text-[var(--cyber-gray)]">
            Create your team to participate in the CTF
          </p>
        </div>

        <Card className="bg-[var(--cyber-card)] border-gray-700 shadow-[var(--cyber-card-shadow)]">
          <CardHeader>
            <CardTitle className="text-[var(--cyber-blue)]">Register Your Team</CardTitle>
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
                  disabled={registerMutation.isPending}
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
                  disabled={registerMutation.isPending}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-[var(--cyber-gray)]">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-[var(--cyber-blue)]"
                  placeholder="Confirm your password"
                  disabled={registerMutation.isPending}
                />
              </div>

              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full bg-[var(--cyber-green)] hover:bg-green-600 text-black font-bold"
              >
                {registerMutation.isPending ? "Creating Team..." : "Create Team"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[var(--cyber-gray)]">
                Already have a team?{" "}
                <Link
                  href="/login"
                  className="text-[var(--cyber-blue)] hover:text-blue-400 font-medium"
                >
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

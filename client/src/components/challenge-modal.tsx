import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ChallengeWithSolves } from "@shared/schema";

interface ChallengeModalProps {
  challenge: ChallengeWithSolves | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChallengeModal({ challenge, isOpen, onClose }: ChallengeModalProps) {
  const [flag, setFlag] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitFlagMutation = useMutation({
    mutationFn: async (data: { challengeId: number; flag: string }) => {
      const response = await apiRequest("POST", "/api/submissions", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.isCorrect ? "Correct!" : "Incorrect",
        description: data.message,
        variant: data.isCorrect ? "default" : "destructive",
      });
      
      if (data.isCorrect) {
        // Invalidate queries to update the UI
        queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
        onClose();
      }
      setFlag("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit flag",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !flag.trim()) return;
    
    submitFlagMutation.mutate({
      challengeId: challenge.id,
      flag: flag.trim(),
    });
  };

  if (!challenge) return null;

  const categoryColors = {
    Web: "bg-[var(--cyber-blue)]",
    Crypto: "bg-[var(--cyber-purple)]",
    Forensics: "bg-[var(--cyber-yellow)] text-black",
    Pwn: "bg-[var(--cyber-red)]",
    Reverse: "bg-[var(--cyber-cyan)] text-black",
    Misc: "bg-gray-400 text-black",
  };

  const categoryColor = categoryColors[challenge.category as keyof typeof categoryColors] || "bg-gray-400";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--cyber-card)] border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[var(--cyber-green)]">
            {challenge.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Badge className={`${categoryColor}`}>
              {challenge.category}
            </Badge>
            <span className="text-[var(--cyber-green)] font-mono font-bold">
              {challenge.points} pts
            </span>
            <span className="text-[var(--cyber-gray)]">
              {challenge.solveCount} solves
            </span>
            {challenge.isSolved && (
              <Badge className="bg-[var(--cyber-green)] text-black">
                Solved
              </Badge>
            )}
          </div>
          
          <div>
            <h4 className="font-bold text-[var(--cyber-blue)] mb-2">Description</h4>
            <p className="text-[var(--cyber-gray)] leading-relaxed">
              {challenge.description}
            </p>
          </div>
          
          {!challenge.isSolved && (
            <div>
              <h4 className="font-bold text-[var(--cyber-blue)] mb-2">Submit Flag</h4>
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="CTF{your_flag_here}"
                  className="flex-1 bg-gray-700 border-gray-600 text-white font-mono focus:border-[var(--cyber-blue)]"
                  disabled={submitFlagMutation.isPending}
                />
                <Button
                  type="submit"
                  disabled={submitFlagMutation.isPending || !flag.trim()}
                  className="bg-[var(--cyber-green)] hover:bg-green-600 text-black font-bold"
                >
                  {submitFlagMutation.isPending ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

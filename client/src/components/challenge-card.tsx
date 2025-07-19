import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Globe, Lock, Search, Bug, Code, Cog } from "lucide-react";
import type { ChallengeWithSolves } from "@shared/schema";

interface ChallengeCardProps {
  challenge: ChallengeWithSolves;
  onSelect: (challenge: ChallengeWithSolves) => void;
}

const categoryIcons = {
  Web: Globe,
  Crypto: Lock,
  Forensics: Search,
  Pwn: Bug,
  Reverse: Code,
  Misc: Cog,
};

const categoryColors = {
  Web: "bg-[var(--cyber-blue)]",
  Crypto: "bg-[var(--cyber-purple)]",
  Forensics: "bg-[var(--cyber-yellow)] text-black",
  Pwn: "bg-[var(--cyber-red)]",
  Reverse: "bg-[var(--cyber-cyan)] text-black",
  Misc: "bg-gray-400 text-black",
};

const pointColors = {
  low: "text-[var(--cyber-green)]", // < 200
  medium: "text-[var(--cyber-blue)]", // 200-300
  high: "text-[var(--cyber-red)]", // > 300
};

export function ChallengeCard({ challenge, onSelect }: ChallengeCardProps) {
  const Icon = categoryIcons[challenge.category as keyof typeof categoryIcons] || Cog;
  const categoryColor = categoryColors[challenge.category as keyof typeof categoryColors] || "bg-gray-400";
  
  const pointColor = challenge.points < 200 ? pointColors.low : 
                    challenge.points <= 300 ? pointColors.medium : 
                    pointColors.high;

  return (
    <Card 
      className={`
        bg-[var(--cyber-card)] rounded-xl shadow-[var(--cyber-card-shadow)] 
        hover:shadow-[var(--cyber-glow-blue)] transition-all duration-300 
        border-2 cursor-pointer
        ${challenge.isSolved 
          ? "border-[var(--cyber-green)] cyber-glow" 
          : "border-transparent hover:border-[var(--cyber-blue)]"
        }
      `}
      onClick={() => onSelect(challenge)}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-[var(--cyber-blue)]" />
            <Badge className={`text-xs ${categoryColor}`}>
              {challenge.category}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {challenge.isSolved && (
              <>
                <CheckCircle className="h-5 w-5 text-[var(--cyber-green)]" />
                <span className="text-[var(--cyber-green)] text-sm font-medium">Solved</span>
              </>
            )}
            {!challenge.isSolved && challenge.points > 400 && (
              <>
                <span className="text-red-400 text-sm">Hard</span>
              </>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-bold mb-2 text-white">{challenge.title}</h3>
        <p className="text-[var(--cyber-gray)] text-sm mb-4 line-clamp-2">
          {challenge.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`font-mono font-bold ${pointColor}`}>
              {challenge.points} pts
            </span>
            <span className="text-[var(--cyber-gray)] text-sm">
              {challenge.solveCount} solves
            </span>
          </div>
          <Button 
            className={`
              font-medium transition-colors
              ${challenge.isSolved 
                ? "bg-[var(--cyber-green)] hover:bg-green-600 text-black" 
                : "bg-[var(--cyber-blue)] hover:bg-blue-600 text-white"
              }
            `}
            size="sm"
          >
            {challenge.isSolved ? "View" : "Solve"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

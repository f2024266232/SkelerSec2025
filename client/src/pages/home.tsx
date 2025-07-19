import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { ChallengeCard } from "@/components/challenge-card";
import { ChallengeModal } from "@/components/challenge-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, CheckCircle, Trophy, Star, Globe, Lock, Search, Bug, Code, Cog } from "lucide-react";
import type { ChallengeWithSolves } from "@shared/schema";

const categories = [
  { name: "All", icon: null, color: "bg-[var(--cyber-blue)]" },
  { name: "Web", icon: Globe, color: "bg-[var(--cyber-blue)]" },
  { name: "Crypto", icon: Lock, color: "bg-[var(--cyber-purple)]" },
  { name: "Forensics", icon: Search, color: "bg-[var(--cyber-yellow)]" },
  { name: "Pwn", icon: Bug, color: "bg-[var(--cyber-red)]" },
  { name: "Reverse", icon: Code, color: "bg-[var(--cyber-cyan)]" },
  { name: "Misc", icon: Cog, color: "bg-gray-400" },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeWithSolves | null>(null);

  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ["/api/challenges"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const filteredChallenges = challenges?.filter((challenge: ChallengeWithSolves) => 
    selectedCategory === "All" || challenge.category === selectedCategory
  ) || [];

  if (challengesLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-[var(--cyber-dark)]">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--cyber-blue)] mx-auto"></div>
            <p className="mt-4 text-[var(--cyber-gray)]">Loading challenges...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cyber-dark)]">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[var(--cyber-card)] border-gray-700 shadow-[var(--cyber-card-shadow)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--cyber-gray)] text-sm">Total Challenges</p>
                  <p className="text-3xl font-bold text-[var(--cyber-green)]">
                    {stats?.totalChallenges || 0}
                  </p>
                </div>
                <Flag className="h-8 w-8 text-[var(--cyber-green)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[var(--cyber-card)] border-gray-700 shadow-[var(--cyber-card-shadow)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--cyber-gray)] text-sm">Solved</p>
                  <p className="text-3xl font-bold text-[var(--cyber-blue)]">
                    {stats?.solved || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-[var(--cyber-blue)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[var(--cyber-card)] border-gray-700 shadow-[var(--cyber-card-shadow)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--cyber-gray)] text-sm">Your Rank</p>
                  <p className="text-3xl font-bold text-[var(--cyber-purple)]">
                    {stats?.rank ? `#${stats.rank}` : "-"}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-[var(--cyber-purple)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[var(--cyber-card)] border-gray-700 shadow-[var(--cyber-card-shadow)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--cyber-gray)] text-sm">Total Points</p>
                  <p className="text-3xl font-bold text-[var(--cyber-green)]">
                    {stats?.points || 0}
                  </p>
                </div>
                <Star className="h-8 w-8 text-[var(--cyber-green)]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenge Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`
                    font-medium transition-colors border-gray-600
                    ${selectedCategory === category.name 
                      ? `${category.color} text-white hover:${category.color}` 
                      : "bg-[var(--cyber-card)] text-[var(--cyber-gray)] hover:bg-gray-600 hover:text-white"
                    }
                  `}
                >
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Challenge Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--cyber-green)] mb-6 flex items-center">
            <Flag className="h-6 w-6 mr-2" />
            Jeopardy Challenges
            {selectedCategory !== "All" && (
              <Badge variant="secondary" className="ml-3">
                {selectedCategory}
              </Badge>
            )}
          </h2>
          
          {filteredChallenges.length === 0 ? (
            <Card className="bg-[var(--cyber-card)] border-gray-700">
              <CardContent className="p-12 text-center">
                <Flag className="h-12 w-12 text-[var(--cyber-gray)] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--cyber-gray)] mb-2">
                  No challenges found
                </h3>
                <p className="text-sm text-[var(--cyber-gray)]">
                  {selectedCategory !== "All" 
                    ? `No challenges in the ${selectedCategory} category yet.`
                    : "No challenges have been created yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge: ChallengeWithSolves) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onSelect={setSelectedChallenge}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ChallengeModal
        challenge={selectedChallenge}
        isOpen={!!selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
      />
    </div>
  );
}

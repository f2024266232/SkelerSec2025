import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Users, Clock } from "lucide-react";
import type { TeamWithScore } from "@shared/schema";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/me"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--cyber-dark)]">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--cyber-blue)] mx-auto"></div>
            <p className="mt-4 text-[var(--cyber-gray)]">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-400" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-400";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-orange-400";
      default:
        return "text-[var(--cyber-gray)]";
    }
  };

  const formatTimeAgo = (date: string | Date | undefined) => {
    if (!date) return "Never";
    
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return "Never";
    
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-[var(--cyber-dark)]">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--cyber-green)] mb-4 flex items-center">
            <Trophy className="h-8 w-8 mr-3" />
            Leaderboard
          </h1>
          <p className="text-[var(--cyber-gray)]">
            Real-time rankings of all participating teams
          </p>
        </div>

        <Card className="bg-[var(--cyber-card)] border-gray-700 shadow-[var(--cyber-card-shadow)]">
          <CardHeader>
            <CardTitle className="text-[var(--cyber-blue)] flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!leaderboard || leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-[var(--cyber-gray)] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--cyber-gray)] mb-2">
                  No teams yet
                </h3>
                <p className="text-sm text-[var(--cyber-gray)]">
                  Be the first team to register and start solving challenges!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--cyber-gray)] uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--cyber-gray)] uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--cyber-gray)] uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--cyber-gray)] uppercase tracking-wider">
                        Solved
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--cyber-gray)] uppercase tracking-wider">
                        Last Solve
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {leaderboard.map((team: TeamWithScore, index: number) => (
                      <tr
                        key={team.id}
                        className={`
                          hover:bg-gray-700 transition-colors
                          ${user?.id === team.id ? "bg-gray-800" : ""}
                        `}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRankIcon(index + 1)}
                            <span className={`text-lg font-bold ml-2 ${getRankColor(index + 1)}`}>
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-[var(--cyber-blue)] mr-2" />
                            <span className="font-medium text-white">
                              {team.name}
                            </span>
                            {user?.id === team.id && (
                              <Badge variant="secondary" className="ml-2 bg-[var(--cyber-purple)] text-white">
                                YOU
                              </Badge>
                            )}
                            {team.isAdmin && (
                              <Badge variant="secondary" className="ml-2 bg-[var(--cyber-red)] text-white">
                                ADMIN
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-mono font-bold text-lg ${getRankColor(index + 1)}`}>
                            {team.score}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[var(--cyber-blue)] font-medium">
                            {team.solvedCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-[var(--cyber-gray)] text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTimeAgo(team.lastSolveAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

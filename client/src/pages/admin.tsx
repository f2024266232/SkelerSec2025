import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Settings, Users, Trash2, Edit, Flag } from "lucide-react";
import type { Challenge, Team } from "@shared/schema";

export default function Admin() {
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    category: "",
    points: "",
    flag: "",
  });
  
  const [newTeam, setNewTeam] = useState({
    name: "",
    password: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: challenges } = useQuery({
    queryKey: ["/api/challenges"],
  });

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/challenges", {
        ...data,
        points: parseInt(data.points),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge Created",
        description: "New challenge has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      setNewChallenge({
        title: "",
        description: "",
        category: "",
        points: "",
        flag: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create challenge",
        variant: "destructive",
      });
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/teams", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Team Created",
        description: "New team has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setNewTeam({
        name: "",
        password: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive",
      });
    },
  });

  const deleteChallengesMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/challenges/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Challenge Deleted",
        description: "Challenge has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete challenge",
        variant: "destructive",
      });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/teams/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Team Deleted",
        description: "Team has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete team",
        variant: "destructive",
      });
    },
  });

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newChallenge.title || !newChallenge.description || !newChallenge.category || !newChallenge.points || !newChallenge.flag) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    createChallengeMutation.mutate(newChallenge);
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTeam.name || !newTeam.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newTeam.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    createTeamMutation.mutate(newTeam);
  };

  const categoryColors = {
    Web: "bg-[var(--cyber-blue)]",
    Crypto: "bg-[var(--cyber-purple)]",
    Forensics: "bg-[var(--cyber-yellow)] text-black",
    Pwn: "bg-[var(--cyber-red)]",
    Reverse: "bg-[var(--cyber-cyan)] text-black",
    Misc: "bg-gray-400 text-black",
  };

  return (
    <div className="min-h-screen bg-[var(--cyber-dark)]">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--cyber-green)] mb-4 flex items-center">
            <Settings className="h-8 w-8 mr-3" />
            Admin Panel
          </h1>
          <p className="text-[var(--cyber-gray)]">
            Manage challenges and teams for the CTF platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Challenge Creation */}
          <Card className="bg-[var(--cyber-card)] border-gray-700 shadow-[var(--cyber-card-shadow)]">
            <CardHeader>
              <CardTitle className="text-[var(--cyber-blue)] flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create New Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateChallenge} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-[var(--cyber-gray)]">Challenge Title</Label>
                  <Input
                    id="title"
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white focus:border-[var(--cyber-blue)]"
                    placeholder="Enter challenge title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-[var(--cyber-gray)]">Category</Label>
                  <Select value={newChallenge.category} onValueChange={(value) => setNewChallenge({ ...newChallenge, category: value })}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-[var(--cyber-blue)]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="Web">Web</SelectItem>
                      <SelectItem value="Crypto">Crypto</SelectItem>
                      <SelectItem value="Forensics">Forensics</SelectItem>
                      <SelectItem value="Pwn">Pwn</SelectItem>
                      <SelectItem value="Reverse">Reverse</SelectItem>
                      <SelectItem value="Misc">Misc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="points" className="text-[var(--cyber-gray)]">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    value={newChallenge.points}
                    onChange={(e) => setNewChallenge({ ...newChallenge, points: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white focus:border-[var(--cyber-blue)]"
                    placeholder="100"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-[var(--cyber-gray)]">Description</Label>
                  <Textarea
                    id="description"
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white focus:border-[var(--cyber-blue)] h-24"
                    placeholder="Challenge description..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="flag" className="text-[var(--cyber-gray)]">Flag</Label>
                  <Input
                    id="flag"
                    value={newChallenge.flag}
                    onChange={(e) => setNewChallenge({ ...newChallenge, flag: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white font-mono focus:border-[var(--cyber-blue)]"
                    placeholder="CTF{example_flag}"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={createChallengeMutation.isPending}
                  className="w-full bg-[var(--cyber-green)] hover:bg-green-600 text-black font-bold"
                >
                  {createChallengeMutation.isPending ? "Creating..." : "Create Challenge"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Team Creation */}
          <Card className="bg-[var(--cyber-card)] border-gray-700 shadow-[var(--cyber-card-shadow)]">
            <CardHeader>
              <CardTitle className="text-[var(--cyber-blue)] flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create New Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <Label htmlFor="teamName" className="text-[var(--cyber-gray)]">Team Name</Label>
                  <Input
                    id="teamName"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white focus:border-[var(--cyber-blue)]"
                    placeholder="Enter team name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="teamPassword" className="text-[var(--cyber-gray)]">Password</Label>
                  <Input
                    id="teamPassword"
                    type="password"
                    value={newTeam.password}
                    onChange={(e) => setNewTeam({ ...newTeam, password: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white focus:border-[var(--cyber-blue)]"
                    placeholder="Enter team password"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={createTeamMutation.isPending}
                  className="w-full bg-[var(--cyber-green)] hover:bg-green-600 text-black font-bold"
                >
                  {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Team Management */}
          <Card className="bg-[var(--cyber-card)] border-gray-700 shadow-[var(--cyber-card-shadow)]">
            <CardHeader>
              <CardTitle className="text-[var(--cyber-blue)] flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teams?.map((team: Team) => (
                  <div key={team.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-[var(--cyber-blue)]" />
                      <div>
                        <span className="font-medium text-white">{team.name}</span>
                        {team.isAdmin && (
                          <Badge variant="secondary" className="ml-2 bg-[var(--cyber-red)] text-white">
                            ADMIN
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!team.isAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTeamMutation.mutate(team.id)}
                        disabled={deleteTeamMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {!teams || teams.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-[var(--cyber-gray)] mx-auto mb-4" />
                    <p className="text-[var(--cyber-gray)]">No teams registered yet</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenge Management */}
        <Card className="bg-[var(--cyber-card)] border-gray-700 shadow-[var(--cyber-card-shadow)] mt-8">
          <CardHeader>
            <CardTitle className="text-[var(--cyber-blue)] flex items-center">
              <Flag className="h-5 w-5 mr-2" />
              Existing Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {challenges && challenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {challenges.map((challenge: Challenge) => (
                  <div key={challenge.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={categoryColors[challenge.category as keyof typeof categoryColors]}>
                        {challenge.category}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteChallengesMutation.mutate(challenge.id)}
                        disabled={deleteChallengesMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-bold text-white mb-2">{challenge.title}</h3>
                    <p className="text-[var(--cyber-gray)] text-sm mb-2 line-clamp-2">
                      {challenge.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--cyber-green)] font-mono font-bold">
                        {challenge.points} pts
                      </span>
                      <code className="text-xs text-[var(--cyber-blue)] bg-gray-800 px-2 py-1 rounded">
                        {challenge.flag}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Flag className="h-12 w-12 text-[var(--cyber-gray)] mx-auto mb-4" />
                <p className="text-[var(--cyber-gray)]">No challenges created yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

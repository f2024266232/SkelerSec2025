import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertTeamSchema, insertChallengeSchema, insertSubmissionSchema, loginSchema } from "@shared/schema.js";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";

// Extend session data interface
declare module "express-session" {
  interface SessionData {
    teamId: number;
  }
}

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS middleware to allow credentials
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Session middleware MUST come first
  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || "ctf-secret-key-very-long-and-secure",
    resave: false,
    saveUninitialized: false,
    rolling: false,
    name: 'connect.sid',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: false, // Must be false for localhost
      sameSite: 'lax',
      path: '/',
    },
  }));

  // Add middleware to log session debugging info AFTER session middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Session ID: ${req.sessionID || 'none'} - TeamID: ${req.session?.teamId || 'none'} - Cookies: ${JSON.stringify(req.headers.cookie || 'none')}`);
    next();
  });

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.teamId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session?.teamId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const team = await storage.getTeam(req.session.teamId);
    if (!team?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Team creation route (Admin only)
  app.post("/api/teams", requireAdmin, async (req, res) => {
    try {
      const data = insertTeamSchema.parse(req.body);
      
      // Check if team name already exists
      const existingTeam = await storage.getTeamByName(data.name);
      if (existingTeam) {
        return res.status(400).json({ message: "Team name already exists" });
      }

      const team = await storage.createTeam(data);
      
      res.json({ 
        id: team.id, 
        name: team.name, 
        isAdmin: team.isAdmin,
        message: "Team created successfully" 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const team = await storage.getTeamByName(data.name);
      if (!team) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(data.password, team.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.teamId = team.id;
      console.log('Session saved with teamId:', req.session.teamId); // Debug log
      res.json({ 
        id: team.id, 
        name: team.name, 
        isAdmin: team.isAdmin,
        message: "Login successful" 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/me", async (req, res) => {
    try {
      console.log('Session data in /api/me:', req.session.teamId); // Debug log
      const teamId = req.session.teamId;
      if (!teamId) {
        console.log('No teamId in session'); // Debug log
        return res.status(401).json({ message: "Authentication required" });
      }
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json({ 
        id: team.id, 
        name: team.name, 
        isAdmin: team.isAdmin 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Challenge routes
  app.get("/api/challenges", requireAuth, async (req, res) => {
    try {
      const teamId = req.session.teamId;
      if (!teamId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const challenges = await storage.getChallengesWithSolves(teamId);
      res.json(challenges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/challenges/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const challenge = await storage.getChallenge(id);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Don't send the flag to non-admin users
      const teamId = req.session.teamId;
      if (!teamId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const team = await storage.getTeam(teamId);
      if (!team?.isAdmin) {
        const { flag, ...challengeWithoutFlag } = challenge;
        res.json(challengeWithoutFlag);
      } else {
        res.json(challenge);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/challenges", requireAdmin, async (req, res) => {
    try {
      const data = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(data);
      res.json(challenge);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/challenges/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertChallengeSchema.partial().parse(req.body);
      const challenge = await storage.updateChallenge(id, data);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      res.json(challenge);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/challenges/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteChallenge(id);
      res.json({ message: "Challenge deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Submission routes
  app.post("/api/submissions", requireAuth, async (req, res) => {
    try {
      const teamId = req.session.teamId;
      if (!teamId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const data = insertSubmissionSchema.parse({
        ...req.body,
        teamId,
      });

      // Check if team has already solved this challenge
      const alreadySolved = await storage.hasTeamSolvedChallenge(teamId, data.challengeId!);
      if (alreadySolved) {
        return res.status(400).json({ message: "Challenge already solved" });
      }

      const submission = await storage.createSubmission(data);
      res.json({
        id: submission.id,
        isCorrect: submission.isCorrect,
        message: submission.isCorrect ? "Correct! Challenge solved!" : "Incorrect flag. Try again.",
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard", requireAuth, async (req, res) => {
    try {
      const leaderboard = await storage.getTeamsWithScores();
      res.json(leaderboard);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Team management routes (admin only)
  app.get("/api/teams", requireAdmin, async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams.map(team => ({ 
        id: team.id, 
        name: team.name, 
        isAdmin: team.isAdmin,
        createdAt: team.createdAt 
      })));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/teams/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTeam(id);
      res.json({ message: "Team deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stats route
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const teamId = req.session.teamId;
      if (!teamId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const challenges = await storage.getAllChallenges();
      const teamSubmissions = await storage.getSubmissionsByTeam(teamId);
      const solvedChallenges = teamSubmissions.filter(sub => sub.isCorrect);
      const solvedCount = new Set(solvedChallenges.map(sub => sub.challengeId)).size;
      
      const teamsWithScores = await storage.getTeamsWithScores();
      const currentTeamRank = teamsWithScores.findIndex(team => team.id === teamId) + 1;
      const currentTeamScore = teamsWithScores.find(team => team.id === teamId)?.score || 0;

      res.json({
        totalChallenges: challenges.length,
        solved: solvedCount,
        rank: currentTeamRank,
        points: currentTeamScore,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

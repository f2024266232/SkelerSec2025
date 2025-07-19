import { eq, desc, sql, count } from "drizzle-orm";
import { db } from "./db";
import { teams, challenges, submissions, type Team, type Challenge, type Submission, type InsertTeam, type InsertChallenge, type InsertSubmission } from "@shared/schema";

export interface TeamWithScore extends Team {
  score: number;
  solvedCount: number;
  lastSolveAt?: Date;
}

export interface ChallengeWithSolves extends Challenge {
  solveCount: number;
  isSolved?: boolean;
}

export interface IStorage {
  // Team methods
  getTeam(id: number): Promise<Team | undefined>;
  getTeamByName(name: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  getAllTeams(): Promise<Team[]>;
  getTeamsWithScores(): Promise<TeamWithScore[]>;
  deleteTeam(id: number): Promise<void>;

  // Challenge methods
  getChallenge(id: number): Promise<Challenge | undefined>;
  getAllChallenges(): Promise<Challenge[]>;
  getChallengesWithSolves(teamId?: number): Promise<ChallengeWithSolves[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: number, challenge: Partial<InsertChallenge>): Promise<Challenge | undefined>;
  deleteChallenge(id: number): Promise<void>;

  // Submission methods
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissionsByTeam(teamId: number): Promise<Submission[]>;
  getSubmissionsByChallenge(challengeId: number): Promise<Submission[]>;
  getAllSubmissions(): Promise<Submission[]>;
  hasTeamSolvedChallenge(teamId: number, challengeId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getTeam(id: number): Promise<Team | undefined> {
    const result = await db.select().from(teams).where(eq(teams.id, id));
    return result[0];
  }

  async getTeamByName(name: string): Promise<Team | undefined> {
    const result = await db.select().from(teams).where(eq(teams.name, name));
    return result[0];
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const result = await db.insert(teams).values(team).returning();
    return result[0];
  }

  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async getTeamsWithScores(): Promise<TeamWithScore[]> {
    const result = await db
      .select({
        id: teams.id,
        name: teams.name,
        password: teams.password,
        isAdmin: teams.isAdmin,
        createdAt: teams.createdAt,
        score: sql<number>`COALESCE(SUM(CASE WHEN ${submissions.isCorrect} THEN ${challenges.points} ELSE 0 END), 0)`,
        solvedCount: sql<number>`COUNT(CASE WHEN ${submissions.isCorrect} THEN 1 END)`,
        lastSolveAt: sql<Date | null>`MAX(CASE WHEN ${submissions.isCorrect} THEN ${submissions.submittedAt} END)`
      })
      .from(teams)
      .leftJoin(submissions, eq(teams.id, submissions.teamId))
      .leftJoin(challenges, eq(submissions.challengeId, challenges.id))
      .where(eq(teams.isAdmin, false))
      .groupBy(teams.id, teams.name, teams.password, teams.isAdmin, teams.createdAt)
      .orderBy(desc(sql`score`), sql`lastSolveAt`);

    return result.map(row => ({
      ...row,
      lastSolveAt: row.lastSolveAt || undefined
    }));
  }

  async deleteTeam(id: number): Promise<void> {
    await db.delete(teams).where(eq(teams.id, id));
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    const result = await db.select().from(challenges).where(eq(challenges.id, id));
    return result[0];
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges).where(eq(challenges.isActive, true));
  }

  async getChallengesWithSolves(teamId?: number): Promise<ChallengeWithSolves[]> {
    const result = await db
      .select({
        id: challenges.id,
        title: challenges.title,
        description: challenges.description,
        category: challenges.category,
        points: challenges.points,
        flag: challenges.flag,
        isActive: challenges.isActive,
        createdAt: challenges.createdAt,
        solveCount: sql<number>`COUNT(CASE WHEN ${submissions.isCorrect} THEN 1 END)`,
        isSolved: teamId ? sql<boolean>`EXISTS(
          SELECT 1 FROM ${submissions} 
          WHERE ${submissions.challengeId} = ${challenges.id} 
          AND ${submissions.teamId} = ${teamId} 
          AND ${submissions.isCorrect} = true
        )` : sql<boolean>`false`
      })
      .from(challenges)
      .leftJoin(submissions, eq(challenges.id, submissions.challengeId))
      .where(eq(challenges.isActive, true))
      .groupBy(challenges.id, challenges.title, challenges.description, challenges.category, challenges.points, challenges.flag, challenges.isActive, challenges.createdAt)
      .orderBy(challenges.points);

    return result;
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const result = await db.insert(challenges).values(challenge).returning();
    return result[0];
  }

  async updateChallenge(id: number, challenge: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    const result = await db.update(challenges).set(challenge).where(eq(challenges.id, id)).returning();
    return result[0];
  }

  async deleteChallenge(id: number): Promise<void> {
    await db.delete(challenges).where(eq(challenges.id, id));
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    // Get the challenge to validate the flag
    const challenge = await this.getChallenge(submission.challengeId!);
    if (!challenge) {
      throw new Error("Challenge not found");
    }
    
    // Check if the flag is correct
    const isCorrect = submission.flag === challenge.flag;
    
    const result = await db.insert(submissions).values({
      ...submission,
      isCorrect
    }).returning();
    return result[0];
  }

  async getSubmissionsByTeam(teamId: number): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.teamId, teamId));
  }

  async getSubmissionsByChallenge(challengeId: number): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.challengeId, challengeId));
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return await db.select().from(submissions);
  }

  async hasTeamSolvedChallenge(teamId: number, challengeId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(submissions)
      .where(
        sql`${submissions.teamId} = ${teamId} AND ${submissions.challengeId} = ${challengeId} AND ${submissions.isCorrect} = true`
      )
      .limit(1);
    
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
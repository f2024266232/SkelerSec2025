import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  points: integer("points").notNull(),
  flag: text("flag").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id),
  challengeId: integer("challenge_id").references(() => challenges.id),
  flag: text("flag").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  submissions: many(submissions),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  team: one(teams, { fields: [submissions.teamId], references: [teams.id] }),
  challenge: one(challenges, { fields: [submissions.challengeId], references: [challenges.id] }),
}));

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  password: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  category: true,
  points: true,
  flag: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  teamId: true,
  challengeId: true,
  flag: true,
});

export const loginSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  password: z.string().min(1, "Password is required"),
});

export type Team = typeof teams.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Login = z.infer<typeof loginSchema>;

export interface TeamWithScore extends Omit<Team, 'createdAt'> {
  createdAt: Date;
  score: number;
  solvedCount: number;
  lastSolveAt?: Date;
}

export interface ChallengeWithSolves extends Omit<Challenge, 'createdAt'> {
  createdAt: Date;
  solveCount: number;
  isSolved?: boolean;
}

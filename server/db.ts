import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from '../shared/schema.js';
import bcrypt from 'bcryptjs';

// Configure Neon for serverless
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = "postgresql://neondb_owner:npg_JTfdm9DMt2Pn@ep-twilight-mouse-a8op4930-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require";

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Initialize database with sample data
async function initializeDatabase() {
  console.log('PostgreSQL database initialized successfully');
  
  try {
    // Check if admin user exists
    const existingAdmin = await db.query.teams.findFirst({
      where: (teams, { eq }) => eq(teams.name, 'admin')
    });

    if (!existingAdmin) {
      // Create admin user
      const hashedPassword = bcrypt.hashSync('SkelerSec2025!', 10);
      await db.insert(schema.teams).values({
        name: 'admin',
        password: hashedPassword,
        isAdmin: true,
      });
      console.log('Created default admin user: admin/SkelerSec2025!');
    }

    // Check if sample challenges exist
    const existingChallenges = await db.query.challenges.findMany();
    
    if (existingChallenges.length === 0) {
      // Insert sample challenges
      await db.insert(schema.challenges).values([
        {
          title: "Welcome to SkelerSecurity",
          description: "Find the hidden flag in the source code of this page.",
          category: "Web",
          points: 100,
          flag: "SKELER{welcome_to_ctf}",
          isActive: true,
        },
        {
          title: "Basic Crypto",
          description: "Decode this simple cipher: ROT13 cipher - FXRYRE{pelcgb_vf_sha}",
          category: "Crypto",
          points: 150,
          flag: "SKELER{crypto_is_fun}",
          isActive: true,
        },
        {
          title: "Network Investigation",
          description: "Analyze the network traffic capture file to find the flag.",
          category: "Forensics",
          points: 200,
          flag: "SKELER{network_detective}",
          isActive: true,
        },
        {
          title: "Buffer Overflow",
          description: "Exploit the buffer overflow vulnerability to get the flag.",
          category: "Pwn",
          points: 300,
          flag: "SKELER{pwn_master}",
          isActive: true,
        },
        {
          title: "Reverse Me",
          description: "Reverse engineer this binary to find the hidden flag.",
          category: "Reverse",
          points: 250,
          flag: "SKELER{reverse_engineering}",
          isActive: true,
        }
      ]);
      console.log('Created sample challenges');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Initialize on startup (only in development with local database)
if (process.env.NODE_ENV === 'development') {
  initializeDatabase().catch(console.error);
}

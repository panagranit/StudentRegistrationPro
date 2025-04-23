import { 
  users, 
  registrations, 
  type User, 
  type InsertUser, 
  type Registration, 
  type InsertRegistration,
  type UpdateRegistration
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Registration operations
  getRegistrations(): Promise<Registration[]>;
  getRegistrationById(id: number): Promise<Registration | undefined>;
  getRegistrationByStudentId(studentId: string): Promise<Registration | undefined>;
  getRegistrationByEmail(email: string): Promise<Registration | undefined>;
  getRegistrationsByStatus(status: string): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistration(id: number, data: Partial<UpdateRegistration>): Promise<Registration | undefined>;
  
  // Stats
  getRegistrationStats(): Promise<{
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Check if admin user exists
      const adminUser = await this.getUserByUsername('admin');
      
      if (!adminUser) {
        // Create default admin user
        console.log("Creating default admin user...");
        await this.createUser({
          username: 'admin',
          password: 'password',
          isAdmin: true
        });
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Registration operations
  async getRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations);
  }

  async getRegistrationById(id: number): Promise<Registration | undefined> {
    const [registration] = await db.select().from(registrations).where(eq(registrations.id, id));
    return registration;
  }

  async getRegistrationByStudentId(studentId: string): Promise<Registration | undefined> {
    const [registration] = await db.select().from(registrations).where(eq(registrations.studentId, studentId));
    return registration;
  }

  async getRegistrationByEmail(email: string): Promise<Registration | undefined> {
    const [registration] = await db.select().from(registrations).where(eq(registrations.email, email));
    return registration;
  }

  async getRegistrationsByStatus(status: string): Promise<Registration[]> {
    return await db.select().from(registrations).where(eq(registrations.status, status));
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const [registration] = await db
      .insert(registrations)
      .values({
        ...insertRegistration,
        status: "pending"
      })
      .returning();
    return registration;
  }

  async updateRegistration(id: number, data: Partial<UpdateRegistration>): Promise<Registration | undefined> {
    const [updatedRegistration] = await db
      .update(registrations)
      .set(data)
      .where(eq(registrations.id, id))
      .returning();
    return updatedRegistration;
  }

  // Stats
  async getRegistrationStats(): Promise<{
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalCount: number;
  }> {
    const [stats] = await db
      .select({
        pendingCount: sql`count(*) filter (where ${registrations.status} = 'pending')`.mapWith(Number),
        approvedCount: sql`count(*) filter (where ${registrations.status} = 'approved')`.mapWith(Number),
        rejectedCount: sql`count(*) filter (where ${registrations.status} = 'rejected')`.mapWith(Number),
        totalCount: sql`count(*)`.mapWith(Number),
      })
      .from(registrations);

    return stats;
  }
}

export const storage = new DatabaseStorage();

import { 
  users, 
  registrations, 
  type User, 
  type InsertUser, 
  type Registration, 
  type InsertRegistration,
  type UpdateRegistration
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private registrations: Map<number, Registration>;
  currentUserId: number;
  currentRegistrationId: number;

  constructor() {
    this.users = new Map();
    this.registrations = new Map();
    this.currentUserId = 1;
    this.currentRegistrationId = 1;
    
    // Create default admin user
    this.createUser({
      username: 'admin',
      password: 'password',
      isAdmin: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Registration operations
  async getRegistrations(): Promise<Registration[]> {
    return Array.from(this.registrations.values());
  }

  async getRegistrationById(id: number): Promise<Registration | undefined> {
    return this.registrations.get(id);
  }

  async getRegistrationByStudentId(studentId: string): Promise<Registration | undefined> {
    return Array.from(this.registrations.values()).find(
      (registration) => registration.studentId === studentId,
    );
  }

  async getRegistrationByEmail(email: string): Promise<Registration | undefined> {
    return Array.from(this.registrations.values()).find(
      (registration) => registration.email === email,
    );
  }

  async getRegistrationsByStatus(status: string): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (registration) => registration.status === status,
    );
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = this.currentRegistrationId++;
    const now = new Date();
    const registration: Registration = { 
      ...insertRegistration, 
      id, 
      status: "pending", 
      submittedAt: now,
      username: null,
      password: null
    };
    this.registrations.set(id, registration);
    return registration;
  }

  async updateRegistration(id: number, data: Partial<UpdateRegistration>): Promise<Registration | undefined> {
    const registration = this.registrations.get(id);
    if (!registration) return undefined;
    
    const updatedRegistration = { ...registration, ...data };
    this.registrations.set(id, updatedRegistration);
    return updatedRegistration;
  }

  // Stats
  async getRegistrationStats(): Promise<{
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalCount: number;
  }> {
    const registrations = Array.from(this.registrations.values());
    const pendingCount = registrations.filter(r => r.status === "pending").length;
    const approvedCount = registrations.filter(r => r.status === "approved").length;
    const rejectedCount = registrations.filter(r => r.status === "rejected").length;
    const totalCount = registrations.length;
    
    return {
      pendingCount,
      approvedCount,
      rejectedCount,
      totalCount
    };
  }
}

export const storage = new MemStorage();

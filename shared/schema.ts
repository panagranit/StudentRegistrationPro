import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  studentId: text("student_id").notNull(),
  course: text("course").notNull(),
  comments: text("comments"),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  username: text("username"),
  password: text("password"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertRegistrationSchema = createInsertSchema(registrations).pick({
  fullName: true,
  email: true,
  studentId: true,
  course: true,
  comments: true,
});

export const updateRegistrationSchema = createInsertSchema(registrations).pick({
  status: true,
  username: true,
  password: true,
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const studentLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type UpdateRegistration = z.infer<typeof updateRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

export type LoginCredentials = z.infer<typeof adminLoginSchema>;

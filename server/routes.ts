import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertRegistrationSchema, 
  adminLoginSchema, 
  updateRegistrationSchema,
  studentLoginSchema 
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "student-registration-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport local strategy for admin login
  passport.use(
    "admin-local",
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !user.isAdmin || user.password !== password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Passport local strategy for student login
  passport.use(
    "student-local",
    new LocalStrategy(async (username, password, done) => {
      try {
        // Find registration with matching username/password
        const registrations = await storage.getRegistrations();
        const registration = registrations.find(
          (r) => r.username === username && r.password === password && r.status === "approved"
        );
        
        if (!registration) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, registration);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, { id: user.id, type: user.isAdmin !== undefined ? "admin" : "student" });
  });

  passport.deserializeUser(async (serialized: any, done) => {
    try {
      if (serialized.type === "admin") {
        const user = await storage.getUser(serialized.id);
        done(null, user);
      } else {
        const registration = await storage.getRegistrationById(serialized.id);
        done(null, registration);
      }
    } catch (error) {
      done(error);
    }
  });

  // Middleware to check if user is authenticated as admin
  const isAdmin = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && (req.user as any).isAdmin) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Middleware to check if user is authenticated as student
  const isStudent = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && !(req.user as any).isAdmin) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // API routes
  // Submit a new registration
  app.post("/api/registrations", async (req, res) => {
    try {
      const data = insertRegistrationSchema.parse(req.body);
      
      // Check if student ID is already registered
      const existingByStudentId = await storage.getRegistrationByStudentId(data.studentId);
      if (existingByStudentId) {
        return res.status(400).json({ message: "Student ID already registered" });
      }
      
      // Check if email is already registered
      const existingByEmail = await storage.getRegistrationByEmail(data.email);
      if (existingByEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const registration = await storage.createRegistration(data);
      res.status(201).json(registration);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Admin login
  app.post("/api/admin/login", (req, res, next) => {
    try {
      adminLoginSchema.parse(req.body);
      
      passport.authenticate("admin-local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info.message });
        
        req.login(user, (err) => {
          if (err) return next(err);
          return res.json({ message: "Login successful" });
        });
      })(req, res, next);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Student login
  app.post("/api/student/login", (req, res, next) => {
    try {
      studentLoginSchema.parse(req.body);
      
      passport.authenticate("student-local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info.message });
        
        req.login(user, (err) => {
          if (err) return next(err);
          return res.json({ message: "Login successful" });
        });
      })(req, res, next);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current authenticated user
  app.get("/api/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Remove password from the response
    const user = req.user as any;
    const sanitizedUser = { ...user, password: undefined };
    res.json(sanitizedUser);
  });

  // Get all registrations (admin only)
  app.get("/api/registrations", isAdmin, async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get registration stats (admin only)
  app.get("/api/registrations/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getRegistrationStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get registration by ID (admin only)
  app.get("/api/registrations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const registration = await storage.getRegistrationById(id);
      
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.json(registration);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Update registration status (admin only)
  app.patch("/api/registrations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = updateRegistrationSchema.partial().parse(req.body);
      
      // If approving, generate username and password if not provided
      if (data.status === "approved" && (!data.username || !data.password)) {
        const registration = await storage.getRegistrationById(id);
        if (!registration) {
          return res.status(404).json({ message: "Registration not found" });
        }
        
        // Generate username from email (part before @)
        if (!data.username) {
          data.username = registration.email.split('@')[0];
        }
        
        // Generate a random password if not provided
        if (!data.password) {
          const randomPassword = Math.random().toString(36).slice(-8);
          data.password = randomPassword;
        }
      }
      
      const updatedRegistration = await storage.updateRegistration(id, data);
      
      if (!updatedRegistration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.json(updatedRegistration);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Get authenticated student's registration
  app.get("/api/student/registration", isStudent, async (req, res) => {
    try {
      const registration = req.user as any;
      res.json(registration);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

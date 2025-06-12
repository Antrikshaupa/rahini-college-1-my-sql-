import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SchemaUser } from "@shared/schema";
import express from "express";
import MySQLStore from "express-mysql-session";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface User extends SchemaUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  try {
    console.log(
      `Comparing passwords - supplied: ${supplied}, stored: ${stored}`
    );
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

    // For development mode - direct comparison for non-hashed passwords
    if (process.env.NODE_ENV === "development" && !stored.includes(".")) {
      console.log("Using direct comparison for non-hashed password");
      const result = supplied === stored;
      console.log(`Direct comparison result: ${result}`);
      return result;
    }

    // For properly hashed passwords
    console.log("Using hashed password comparison");
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.log("Invalid stored password format (missing hash or salt)");
      return false;
    }

    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;

    const result =
      hashedBuf.length === suppliedBuf.length &&
      timingSafeEqual(hashedBuf, suppliedBuf);
    console.log(`Hashed comparison result: ${result}`);
    return result;
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupAuth(app: express.Express): void {
  // Set up session middleware
  const sessionSecret =
    process.env.SESSION_SECRET || "rahini-college-secret-key";

  const MySQLStoreSession = MySQLStore(session);

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MySQLStoreSession({
      host: process.env.MYSQL_HOST || "localhost",
      port: parseInt(process.env.MYSQL_PORT || "3306"),
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "portfolio_db",
      createDatabaseTable: true,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Special development admin account for testing
        if (
          process.env.NODE_ENV === "development" &&
          username === "admin" &&
          password === "admin123"
        ) {
          console.log("Using hardcoded admin account for development");
          const adminUser = {
            id: 999,
            username: "admin",
            password: "admin123",
            role: "admin",
          };
          return done(null, adminUser);
        }

        const user = await db.query.users.findFirst({
          where: eq(users.username, username),
        });

        if (!user) {
          console.log("User not found");
          return done(null, false, { message: "Incorrect username" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    })
  );

  // Configure how user objects are serialized and deserialized for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      // Special handling for our hardcoded admin user
      if (id === 999) {
        console.log("Deserializing hardcoded admin user");
        done(null, {
          id: 999,
          username: "admin",
          password: "admin123",
          role: "admin",
        });
        return;
      }

      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (!user) {
        return done(new Error("User not found"));
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(req.body.password);

      // Create user with default role if not specified
      const role = req.body.role || "user";

      // Create user in storage
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        role,
      });

      // Log user in
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user data without password
        const { password, ...userData } = user;
        res.status(201).json(userData);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res
            .status(401)
            .json({ message: info?.message || "Authentication failed" });
        }

        req.login(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }

          // Return user data without password
          const { password, ...userData } = user;
          return res.json(userData);
        });
      }
    )(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Return user data without password
    const { password, ...userData } = req.user;
    res.json(userData);
  });
}

// Middleware to require authentication
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

// Middleware to require admin role
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
}

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/utils/email.ts
var email_exports = {};
__export(email_exports, {
  generateUnsubscribeToken: () => generateUnsubscribeToken,
  sendEmail: () => sendEmail,
  sendNewsletterEmail: () => sendNewsletterEmail,
  sendUnsubscribeConfirmation: () => sendUnsubscribeConfirmation,
  sendWelcomeEmail: () => sendWelcomeEmail
});
import { randomBytes as randomBytes2 } from "crypto";
import sgMail from "@sendgrid/mail";
function generateUnsubscribeToken() {
  return randomBytes2(32).toString("hex");
}
function getTemplateHTML(template, data = {}) {
  switch (template) {
    case "welcome":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">Welcome to Rahini College Newsletter</h1>
          </div>
          <p>Hello ${data.name ? data.name : "there"},</p>
          <p>Thank you for subscribing to our newsletter. We're excited to keep you updated with all the latest news, events, and announcements from Rahini College of Art and Design.</p>
          <p>You'll receive updates on:</p>
          <ul>
            <li>Upcoming exhibitions and events</li>
            <li>New courses and programs</li>
            <li>Student achievements and alumni news</li>
            <li>Campus updates and announcements</li>
          </ul>
          <p>If you ever want to unsubscribe, you can click the unsubscribe link in any of our emails.</p>
          <p>Best regards,<br>The Rahini College Team</p>
        </div>
      `;
    case "newsletter":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">Rahini College Newsletter</h1>
          </div>
          <h2>${data.subject || "Latest Updates"}</h2>
          ${data.content || ""}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
            <p>You're receiving this email because you subscribed to the Rahini College newsletter.</p>
            <p>If you no longer wish to receive these emails, you can <a href="${data.unsubscribeUrl || "#"}">unsubscribe here</a>.</p>
          </div>
        </div>
      `;
    case "unsubscribe":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">Unsubscribe Confirmation</h1>
          </div>
          <p>Hello,</p>
          <p>We're sorry to see you go! You have been successfully unsubscribed from the Rahini College newsletter.</p>
          <p>If you unsubscribed by mistake, you can always subscribe again from our website.</p>
          <p>Best regards,<br>The Rahini College Team</p>
        </div>
      `;
    default:
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Rahini College</h1>
          ${data.content || "No content provided"}
        </div>
      `;
  }
}
async function sendEmail({
  to,
  subject,
  html,
  text: text2,
  template,
  templateData = {}
}) {
  if (!process.env.SENDGRID_API_KEY) {
    console.error("SendGrid API key not found. Email not sent.");
    return false;
  }
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const mailOptions = {
      to,
      from: process.env.EMAIL_FROM || "noreply@rahini.college",
      subject,
      text: text2 || "",
      html: html || (template ? getTemplateHTML(template, templateData) : "")
    };
    await sgMail.send(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
async function sendWelcomeEmail(email, name) {
  return sendEmail({
    to: email,
    subject: "Welcome to Rahini College Newsletter",
    template: "welcome",
    templateData: { name }
  });
}
async function sendNewsletterEmail(email, subject, content2, unsubscribeToken) {
  const unsubscribeUrl = `${process.env.PUBLIC_URL || "http://localhost:5000"}/api/unsubscribe/${unsubscribeToken}`;
  return sendEmail({
    to: email,
    subject,
    template: "newsletter",
    templateData: {
      subject,
      content: content2,
      unsubscribeUrl
    }
  });
}
async function sendUnsubscribeConfirmation(email) {
  return sendEmail({
    to: email,
    subject: "You have been unsubscribed from Rahini College Newsletter",
    template: "unsubscribe"
  });
}
var init_email = __esm({
  "server/utils/email.ts"() {
    "use strict";
  }
});

// server/index.ts
import dotenv2 from "dotenv";
import path4 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  contactMessages: () => contactMessages,
  content: () => content,
  courses: () => courses,
  departments: () => departments,
  events: () => events,
  faqs: () => faqs,
  galleryItems: () => galleryItems,
  insertContactMessageSchema: () => insertContactMessageSchema,
  insertContentSchema: () => insertContentSchema,
  insertCourseSchema: () => insertCourseSchema,
  insertDepartmentSchema: () => insertDepartmentSchema,
  insertEventSchema: () => insertEventSchema,
  insertFaqSchema: () => insertFaqSchema,
  insertGalleryItemSchema: () => insertGalleryItemSchema,
  insertSubscriberSchema: () => insertSubscriberSchema,
  insertUserSchema: () => insertUserSchema,
  sessions: () => sessions,
  subscribers: () => subscribers,
  users: () => users
});
import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  json,
  varchar
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable("session", {
  sid: varchar("sid").notNull().primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull()
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true
});
var content = pgTable("content", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(),
  // E.g., 'home_hero', 'about', etc.
  title: text("title"),
  subtitle: text("subtitle"),
  description: text("description"),
  image_url: text("image_url"),
  link_url: text("link_url"),
  link_text: text("link_text"),
  order: integer("order").default(0),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var insertContentSchema = createInsertSchema(content).omit({
  id: true,
  created_at: true,
  updated_at: true
});
var courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  // E.g., 'undergraduate', 'postgraduate', 'certificate'
  duration: text("duration").notNull(),
  description: text("description").notNull(),
  image_url: text("image_url"),
  is_featured: boolean("is_featured").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  created_at: true,
  updated_at: true
});
var departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image_url: text("image_url"),
  faculty_count: integer("faculty_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  created_at: true,
  updated_at: true
});
var galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist"),
  category: text("category").notNull(),
  // E.g., 'paintings', 'digital', 'sculptures', 'photography'
  image_url: text("image_url").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var insertGalleryItemSchema = createInsertSchema(galleryItems).omit({
  id: true,
  created_at: true,
  updated_at: true
});
var events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  end_date: timestamp("end_date"),
  location: text("location").notNull(),
  image_url: text("image_url"),
  category: text("category").default("general"),
  is_featured: boolean("is_featured").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var insertEventSchema = createInsertSchema(events).omit({
  id: true,
  created_at: true,
  updated_at: true
});
var faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").default("general"),
  order: integer("order").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  created_at: true,
  updated_at: true
});
var contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  category: text("category").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  is_read: boolean("is_read").default(false),
  created_at: timestamp("created_at").defaultNow()
});
var insertContactMessageSchema = createInsertSchema(
  contactMessages
).omit({
  id: true,
  is_read: true,
  created_at: true
});
var subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  interests: text("interests").array(),
  // Array of interest categories
  subscription_date: timestamp("subscription_date").defaultNow(),
  is_active: boolean("is_active").default(true),
  unsubscribe_token: text("unsubscribe_token"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  is_active: true,
  unsubscribe_token: true,
  created_at: true,
  updated_at: true
});

// server/storage.ts
import session from "express-session";
import connectPg from "connect-pg-simple";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var envPath = path.resolve(__dirname, "..", ".env");
var result = dotenv.config({ path: envPath });
if (result.error) {
  console.error("Error loading .env file:", result.error);
  console.error("Looked for .env at path:", envPath);
} else {
  console.log(".env file loaded successfully from:", envPath);
  console.log("DATABASE_URL found:", process.env.DATABASE_URL ? "Yes" : "No");
}
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, gte, lt, sql } from "drizzle-orm";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: "session",
      // Uses 'session' table
      createTableIfMissing: true
    });
    this.seedAdminUser();
  }
  async seedAdminUser() {
    try {
      const existingAdmin = await this.getUserByUsername("admin");
      if (!existingAdmin) {
        await this.createUser({
          username: "admin",
          password: "admin123",
          // For development only - in production, this would be hashed
          role: "admin"
        });
        console.log("Admin user created");
      }
    } catch (error) {
      console.error("Error seeding admin user:", error);
    }
  }
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Content methods
  async getAllContent() {
    return await db.select().from(content);
  }
  async getContentBySection(section) {
    return await db.select().from(content).where(eq(content.section, section));
  }
  async createContent(contentData) {
    const [newContent] = await db.insert(content).values(contentData).returning();
    return newContent;
  }
  async updateContent(id, contentData) {
    const [updatedContent] = await db.update(content).set({ ...contentData, updated_at: /* @__PURE__ */ new Date() }).where(eq(content.id, id)).returning();
    if (!updatedContent) {
      throw new Error(`Content with id ${id} not found`);
    }
    return updatedContent;
  }
  // Course methods
  async getAllCourses() {
    return await db.select().from(courses);
  }
  async getCoursesByCategory(category) {
    return await db.select().from(courses).where(eq(courses.category, category));
  }
  // Department methods
  async getAllDepartments() {
    return await db.select().from(departments);
  }
  // Gallery methods
  async getAllGalleryItems() {
    return await db.select().from(galleryItems);
  }
  async getGalleryItemsByCategory(category) {
    return await db.select().from(galleryItems).where(eq(galleryItems.category, category));
  }
  // Event methods
  async getAllEvents() {
    return await db.select().from(events);
  }
  async getUpcomingEvents() {
    const now = /* @__PURE__ */ new Date();
    return await db.select().from(events).where(gte(events.date, now));
  }
  async getPastEvents() {
    const now = /* @__PURE__ */ new Date();
    return await db.select().from(events).where(lt(events.date, now));
  }
  // FAQ methods
  async getAllFAQs() {
    return await db.select().from(faqs);
  }
  // Contact message methods
  async createContactMessage(messageData) {
    const [message] = await db.insert(contactMessages).values(messageData).returning();
    return message;
  }
  // Subscriber methods
  async createSubscriber(subscriberData) {
    const [subscriber] = await db.insert(subscribers).values(subscriberData).returning();
    return subscriber;
  }
  async getSubscriberByEmail(email) {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.email, email));
    return subscriber;
  }
  async getSubscriberByToken(token) {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.unsubscribe_token, token));
    return subscriber;
  }
  async updateSubscriber(id, data) {
    const [updatedSubscriber] = await db.update(subscribers).set(data).where(eq(subscribers.id, id)).returning();
    if (!updatedSubscriber) {
      throw new Error(`Subscriber with id ${id} not found`);
    }
    return updatedSubscriber;
  }
  async getAllSubscribers() {
    return await db.select().from(subscribers);
  }
  async getActiveSubscribers() {
    return await db.select().from(subscribers).where(eq(subscribers.is_active, true));
  }
  async getSubscribersByIds(ids) {
    return await db.select().from(subscribers).where(
      // Using SQL IN operator via drizzle-orm's inArray method
      sql`${subscribers.id} IN (${ids.join(",")})`
    );
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  try {
    console.log(`Comparing passwords - supplied: ${supplied}, stored: ${stored}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    if (process.env.NODE_ENV === "development" && !stored.includes(".")) {
      console.log("Using direct comparison for non-hashed password");
      const result4 = supplied === stored;
      console.log(`Direct comparison result: ${result4}`);
      return result4;
    }
    console.log("Using hashed password comparison");
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.log("Invalid stored password format (missing hash or salt)");
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    const result3 = hashedBuf.length === suppliedBuf.length && timingSafeEqual(hashedBuf, suppliedBuf);
    console.log(`Hashed comparison result: ${result3}`);
    return result3;
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}
function setupAuth(app2) {
  const sessionSecret = process.env.SESSION_SECRET || "rahini-college-secret-key";
  const sessionSettings = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1e3 * 60 * 60 * 24 * 7
      // 1 week
    },
    store: storage.sessionStore
  };
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Login attempt: username=${username}, password=${password}`);
        if (process.env.NODE_ENV === "development" && username === "admin" && password === "admin123") {
          console.log("Using hardcoded admin account for development");
          const adminUser = {
            id: 999,
            username: "admin",
            password: "admin123",
            role: "admin"
          };
          return done(null, adminUser);
        }
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log("User not found");
          return done(null, false, { message: "Incorrect username" });
        }
        console.log(`User found: ${JSON.stringify(user)}`);
        const isValidPassword = await comparePasswords(password, user.password);
        console.log(`Password comparison result: ${isValidPassword}`);
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
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      if (id === 999) {
        console.log("Deserializing hardcoded admin user");
        done(null, {
          id: 999,
          username: "admin",
          password: "admin123",
          role: "admin"
        });
        return;
      }
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error("User not found"));
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(req.body.password);
      const role = req.body.role || "user";
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        role
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userData } = user;
        res.status(201).json(userData);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        const { password, ...userData } = user;
        return res.json(userData);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userData } = req.user;
    res.json(userData);
  });
}
function requireAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/content", async (req, res) => {
    try {
      const content2 = await storage.getAllContent();
      res.json(content2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching content" });
    }
  });
  app2.get("/api/content/:section", async (req, res) => {
    try {
      const { section } = req.params;
      const content2 = await storage.getContentBySection(section);
      res.json(content2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching content" });
    }
  });
  app2.get("/api/courses", async (req, res) => {
    try {
      const courses2 = await storage.getAllCourses();
      res.json(courses2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses" });
    }
  });
  app2.get("/api/courses/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const courses2 = await storage.getCoursesByCategory(category);
      res.json(courses2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses" });
    }
  });
  app2.get("/api/departments", async (req, res) => {
    try {
      const departments2 = await storage.getAllDepartments();
      res.json(departments2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching departments" });
    }
  });
  app2.get("/api/gallery", async (req, res) => {
    try {
      const gallery = await storage.getAllGalleryItems();
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ message: "Error fetching gallery items" });
    }
  });
  app2.get("/api/gallery/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const gallery = await storage.getGalleryItemsByCategory(category);
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ message: "Error fetching gallery items" });
    }
  });
  app2.get("/api/events", async (req, res) => {
    try {
      const events2 = await storage.getAllEvents();
      res.json(events2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching events" });
    }
  });
  app2.get("/api/events/upcoming", async (req, res) => {
    try {
      const events2 = await storage.getUpcomingEvents();
      res.json(events2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching upcoming events" });
    }
  });
  app2.get("/api/events/past", async (req, res) => {
    try {
      const events2 = await storage.getPastEvents();
      res.json(events2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching past events" });
    }
  });
  app2.get("/api/faqs", async (req, res) => {
    try {
      const faqs2 = await storage.getAllFAQs();
      res.json(faqs2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching FAQs" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactMessageSchema.parse(req.body);
      const result3 = await storage.createContactMessage(contactData);
      res.status(201).json({ message: "Message sent successfully", id: result3.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid form data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error submitting contact form" });
      }
    }
  });
  app2.post("/api/subscribe", async (req, res) => {
    try {
      const subscriptionData = insertSubscriberSchema.parse(req.body);
      try {
        const existingSubscriber = await storage.getSubscriberByEmail(subscriptionData.email);
        if (existingSubscriber) {
          if (existingSubscriber.is_active) {
            return res.status(400).json({ message: "Email is already subscribed" });
          } else {
            const reactivated = await storage.updateSubscriber(existingSubscriber.id, {
              is_active: true,
              first_name: subscriptionData.first_name,
              last_name: subscriptionData.last_name,
              interests: subscriptionData.interests,
              updated_at: /* @__PURE__ */ new Date()
            });
            if (process.env.SENDGRID_API_KEY) {
              const { sendWelcomeEmail: sendWelcomeEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
              await sendWelcomeEmail2(reactivated.email, reactivated.first_name || void 0);
            }
            return res.status(200).json({
              message: "Subscription reactivated successfully",
              id: reactivated.id
            });
          }
        }
      } catch (error) {
        console.error("Error checking existing subscriber:", error);
      }
      let unsubscribeToken;
      try {
        const { generateUnsubscribeToken: generateUnsubscribeToken2 } = await Promise.resolve().then(() => (init_email(), email_exports));
        unsubscribeToken = generateUnsubscribeToken2();
      } catch (error) {
        console.error("Error generating unsubscribe token:", error);
      }
      const result3 = await storage.createSubscriber({
        ...subscriptionData,
        unsubscribe_token: unsubscribeToken
      });
      if (process.env.SENDGRID_API_KEY) {
        try {
          const { sendWelcomeEmail: sendWelcomeEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          await sendWelcomeEmail2(result3.email, result3.first_name || void 0);
        } catch (error) {
          console.error("Error sending welcome email:", error);
        }
      }
      res.status(201).json({ message: "Subscribed successfully", id: result3.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      } else {
        console.error("Subscription error:", error);
        res.status(500).json({ message: "Error processing subscription" });
      }
    }
  });
  app2.get("/api/unsubscribe/:token", async (req, res) => {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({ message: "Invalid unsubscribe token" });
      }
      const subscriber = await storage.getSubscriberByToken(token);
      if (!subscriber) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      if (!subscriber.is_active) {
        return res.status(400).json({ message: "Already unsubscribed" });
      }
      const updated = await storage.updateSubscriber(subscriber.id, {
        is_active: false,
        updated_at: /* @__PURE__ */ new Date()
      });
      if (process.env.SENDGRID_API_KEY) {
        try {
          const { sendUnsubscribeConfirmation: sendUnsubscribeConfirmation2 } = await Promise.resolve().then(() => (init_email(), email_exports));
          await sendUnsubscribeConfirmation2(updated.email);
        } catch (error) {
          console.error("Error sending unsubscribe confirmation:", error);
        }
      }
      res.status(200).json({ message: "Successfully unsubscribed" });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      res.status(500).json({ message: "Error processing unsubscribe request" });
    }
  });
  app2.get("/api/admin/subscribers", requireAdmin, async (req, res) => {
    try {
      const subscribers2 = await storage.getAllSubscribers();
      res.json(subscribers2);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Error fetching subscribers" });
    }
  });
  app2.post("/api/admin/send-newsletter", requireAdmin, async (req, res) => {
    try {
      const { subject, content: content2, recipientIds } = req.body;
      if (!subject || !content2) {
        return res.status(400).json({ message: "Subject and content are required" });
      }
      if (!process.env.SENDGRID_API_KEY) {
        return res.status(500).json({ message: "SendGrid API key is not configured" });
      }
      let subscribers2 = [];
      if (recipientIds && Array.isArray(recipientIds) && recipientIds.length > 0) {
        subscribers2 = await storage.getSubscribersByIds(recipientIds);
      } else {
        subscribers2 = await storage.getActiveSubscribers();
      }
      if (subscribers2.length === 0) {
        return res.status(400).json({ message: "No active subscribers found" });
      }
      const { sendNewsletterEmail: sendNewsletterEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      const results = {
        total: subscribers2.length,
        sent: 0,
        failed: 0,
        errors: []
      };
      for (const subscriber of subscribers2) {
        try {
          const success = await sendNewsletterEmail2(
            subscriber.email,
            subject,
            content2,
            subscriber.unsubscribe_token || ""
          );
          if (success) {
            results.sent++;
          } else {
            results.failed++;
            results.errors.push({ email: subscriber.email, reason: "Send failed" });
          }
        } catch (error) {
          results.failed++;
          results.errors.push({ email: subscriber.email, reason: String(error) });
        }
      }
      res.status(200).json({
        message: `Newsletter sent to ${results.sent} subscribers`,
        results
      });
    } catch (error) {
      console.error("Error sending newsletter:", error);
      res.status(500).json({ message: "Error sending newsletter" });
    }
  });
  app2.post("/api/admin/content", requireAdmin, async (req, res) => {
    try {
      const contentData = req.body;
      const result3 = await storage.createContent(contentData);
      res.status(201).json(result3);
    } catch (error) {
      res.status(500).json({ message: "Error creating content" });
    }
  });
  app2.put("/api/admin/content/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const contentData = req.body;
      const result3 = await storage.updateContent(parseInt(id), contentData);
      res.json(result3);
    } catch (error) {
      res.status(500).json({ message: "Error updating content" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/seed.ts
async function seedData() {
  try {
    console.log("Checking for existing content...");
    const existingContent = await db.select().from(content);
    if (existingContent.length > 0) {
      console.log("Database already has content, skipping seed");
      return;
    }
    console.log("Seeding database with initial data...");
    await seedContent();
    await seedCourses();
    await seedDepartments();
    await seedGalleryItems();
    await seedEvents();
    await seedFAQs();
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
async function seedContent() {
  const now = /* @__PURE__ */ new Date();
  await db.insert(content).values([
    {
      title: "Welcome to Rahini College",
      section: "home",
      subtitle: "Excellence in Art and Design Education",
      description: "Rahini College of Art and Design offers world-class education in creative disciplines. Our programs combine traditional techniques with cutting-edge technologies to prepare students for successful careers in the arts.",
      order: 1,
      image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
      link_url: "/about",
      link_text: "Learn More",
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      title: "Upcoming Admissions",
      section: "home",
      subtitle: "Applications Open for Fall 2025",
      description: "Join our vibrant creative community. Applications for the Fall 2025 semester are now open. Early applications receive priority consideration for scholarships and financial aid.",
      order: 2,
      image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
      link_url: "/admissions",
      link_text: "Apply Now",
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      title: "Our History",
      section: "about",
      subtitle: "A Legacy of Creative Excellence",
      description: "Founded in 1985, Rahini College has grown from a small design school to a comprehensive art and design institution. For over three decades, we have been at the forefront of creative education, adapting to industry changes while maintaining our commitment to excellence.",
      order: 1,
      image_url: "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51",
      link_url: null,
      link_text: null,
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      title: "Our Mission",
      section: "about",
      subtitle: "Inspiring Creative Leaders",
      description: "Our mission is to nurture creative talent and prepare students for successful careers in art and design. We provide an inclusive environment where diverse perspectives are valued and innovation is encouraged.",
      order: 2,
      image_url: null,
      link_url: null,
      link_text: null,
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      title: "Contact Information",
      section: "footer",
      subtitle: null,
      description: "123 Art Avenue, Designville, DV 12345<br>Phone: (555) 123-4567<br>Email: info@rahinicollege.edu",
      order: 1,
      image_url: null,
      link_url: null,
      link_text: null,
      is_active: true,
      created_at: now,
      updated_at: now
    }
  ]);
  console.log("Content seeded successfully");
}
async function seedCourses() {
  const now = /* @__PURE__ */ new Date();
  await db.insert(courses).values([
    {
      title: "Bachelor of Fine Arts",
      category: "undergraduate",
      duration: "4 years",
      description: "A comprehensive program covering painting, sculpture, and mixed media arts with focus on traditional and contemporary techniques.",
      image_url: "https://images.unsplash.com/photo-1509343256512-d77a5cb3791b",
      is_featured: true,
      created_at: now,
      updated_at: now
    },
    {
      title: "Master of Design",
      category: "postgraduate",
      duration: "2 years",
      description: "Advanced design studies focusing on innovative approaches to visual communication, product design, and digital interfaces.",
      image_url: "https://images.unsplash.com/photo-1508780709619-79562169bc64",
      is_featured: true,
      created_at: now,
      updated_at: now
    },
    {
      title: "Certificate in Digital Art",
      category: "certificate",
      duration: "6 months",
      description: "Introduction to digital art tools and techniques, covering digital painting, 3D modeling, and animation basics.",
      image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
      is_featured: false,
      created_at: now,
      updated_at: now
    },
    {
      title: "Bachelor of Animation",
      category: "undergraduate",
      duration: "4 years",
      description: "Comprehensive program covering 2D and 3D animation, storyboarding, character design, and motion graphics.",
      image_url: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85",
      is_featured: true,
      created_at: now,
      updated_at: now
    },
    {
      title: "Master of Fine Arts",
      category: "postgraduate",
      duration: "2 years",
      description: "Advanced studio practice and theoretical studies for aspiring professional artists and art educators.",
      image_url: "https://images.unsplash.com/photo-1452802447250-470a88ac82bc",
      is_featured: false,
      created_at: now,
      updated_at: now
    }
  ]);
  console.log("Courses seeded successfully");
}
async function seedDepartments() {
  const now = /* @__PURE__ */ new Date();
  await db.insert(departments).values([
    {
      name: "Fine Arts",
      description: "Focuses on traditional and contemporary painting, drawing, sculpture, and printmaking techniques.",
      image_url: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5",
      faculty_count: 12,
      created_at: now,
      updated_at: now
    },
    {
      name: "Graphic Design",
      description: "Covers visual communication, typography, branding, and digital design for print and interactive media.",
      image_url: "https://images.unsplash.com/photo-1626785774573-4b799315345d",
      faculty_count: 8,
      created_at: now,
      updated_at: now
    },
    {
      name: "Animation and Digital Arts",
      description: "Explores 2D and 3D animation, motion graphics, digital illustration, and interactive design.",
      image_url: "https://images.unsplash.com/photo-1551503766-ac63dfa6401c",
      faculty_count: 10,
      created_at: now,
      updated_at: now
    },
    {
      name: "Photography",
      description: "Studies digital and analog photography techniques, composition, lighting, and image editing.",
      image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
      faculty_count: 7,
      created_at: now,
      updated_at: now
    },
    {
      name: "Fashion Design",
      description: "Focuses on clothing design, textile development, pattern making, and fashion illustration.",
      image_url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e",
      faculty_count: 9,
      created_at: now,
      updated_at: now
    }
  ]);
  console.log("Departments seeded successfully");
}
async function seedGalleryItems() {
  const now = /* @__PURE__ */ new Date();
  await db.insert(galleryItems).values([
    {
      title: "Harmony in Blue",
      artist: "Jessica Chen",
      category: "paintings",
      image_url: "https://images.unsplash.com/photo-1549887534-1541e9326642",
      created_at: now,
      updated_at: now
    },
    {
      title: "Digital Landscape",
      artist: "Marcus Rodriguez",
      category: "digital",
      image_url: "https://images.unsplash.com/photo-1563089145-599997674d42",
      created_at: now,
      updated_at: now
    },
    {
      title: "Urban Motion",
      artist: "Sophia Williams",
      category: "photography",
      image_url: "https://images.unsplash.com/photo-1520990903205-db4682c5c03d",
      created_at: now,
      updated_at: now
    },
    {
      title: "Bronze Guardian",
      artist: "David Park",
      category: "sculptures",
      image_url: "https://images.unsplash.com/photo-1560457079-9a6532ccb118",
      created_at: now,
      updated_at: now
    },
    {
      title: "Abstract Patterns",
      artist: "Elena Torres",
      category: "paintings",
      image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262",
      created_at: now,
      updated_at: now
    },
    {
      title: "Futuristic City",
      artist: "Jordan Smith",
      category: "digital",
      image_url: "https://images.unsplash.com/photo-1559028012-481c04fa702d",
      created_at: now,
      updated_at: now
    },
    {
      title: "Moments in Time",
      artist: "Maya Johnson",
      category: "photography",
      image_url: "https://images.unsplash.com/photo-1554668048-bd9f3755d482",
      created_at: now,
      updated_at: now
    },
    {
      title: "Geometric Harmony",
      artist: "Alex Turner",
      category: "sculptures",
      image_url: "https://images.unsplash.com/photo-1564399579883-451a5cb0507e",
      created_at: now,
      updated_at: now
    }
  ]);
  console.log("Gallery items seeded successfully");
}
async function seedEvents() {
  const now = /* @__PURE__ */ new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(now.getMonth() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  const nextYear = new Date(now);
  nextYear.setFullYear(now.getFullYear() + 1);
  await db.insert(events).values([
    {
      title: "Annual Student Exhibition",
      description: "A showcase of the best student works from all departments. Join us for the opening reception with refreshments and live music.",
      date: nextMonth,
      location: "Main Gallery, West Campus",
      image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      category: "exhibition",
      is_featured: true,
      created_at: now,
      updated_at: now
    },
    {
      title: "Guest Lecture: Modern Digital Art",
      description: "Renowned digital artist Hannah Kim discusses her creative process and the evolving landscape of digital art in contemporary culture.",
      date: nextWeek,
      location: "Auditorium A, East Campus",
      image_url: "https://images.unsplash.com/photo-1558403194-611308249627",
      category: "lecture",
      is_featured: false,
      created_at: now,
      updated_at: now
    },
    {
      title: "Workshop: Introduction to Screen Printing",
      description: "Learn the basics of screen printing in this hands-on workshop led by Professor James Wilson. All materials provided.",
      date: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1e3),
      location: "Print Studio, Main Building",
      image_url: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9",
      category: "workshop",
      is_featured: false,
      created_at: now,
      updated_at: now
    },
    {
      title: "Alumni Art Fair",
      description: "Annual gathering of Rahini College alumni showcasing their professional work and achievements since graduation.",
      date: new Date(nextMonth.getTime() + 15 * 24 * 60 * 60 * 1e3),
      location: "Central Plaza",
      image_url: "https://images.unsplash.com/photo-1559406041-c7d2b2e98690",
      category: "fair",
      is_featured: true,
      created_at: now,
      updated_at: now
    },
    {
      title: "Graduation Ceremony 2026",
      description: "Annual commencement ceremony celebrating our graduating students and their achievements.",
      date: nextYear,
      location: "Grand Hall, Conference Center",
      image_url: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b",
      category: "ceremony",
      is_featured: true,
      created_at: now,
      updated_at: now
    }
  ]);
  console.log("Events seeded successfully");
}
async function seedFAQs() {
  const now = /* @__PURE__ */ new Date();
  await db.insert(faqs).values([
    {
      question: "What degrees does Rahini College offer?",
      answer: "Rahini College offers Bachelor's and Master's degrees in Fine Arts, Design, Animation, Photography, and Fashion Design. We also offer certificate programs in specialized areas.",
      category: "admissions",
      order: 1,
      created_at: now,
      updated_at: now
    },
    {
      question: "How do I apply for admission?",
      answer: "To apply, submit the online application form, your portfolio, academic transcripts, and letters of recommendation. Applications for the Fall semester open in January and close in April each year.",
      category: "admissions",
      order: 2,
      created_at: now,
      updated_at: now
    },
    {
      question: "Are scholarships available?",
      answer: "Yes, Rahini College offers merit-based scholarships, need-based financial aid, and department-specific awards. Apply for scholarships when submitting your admission application.",
      category: "financial",
      order: 1,
      created_at: now,
      updated_at: now
    },
    {
      question: "What facilities are available for students?",
      answer: "Our campus includes specialized studios, digital labs, library, exhibition spaces, student lounge, cafeteria, and residence halls. Students have 24/7 access to most facilities with their ID cards.",
      category: "campus",
      order: 1,
      created_at: now,
      updated_at: now
    },
    {
      question: "Does Rahini College offer housing?",
      answer: "Yes, on-campus housing is available for first-year and international students. Upper-level students can apply for limited on-campus housing or seek assistance finding accommodations nearby.",
      category: "housing",
      order: 1,
      created_at: now,
      updated_at: now
    },
    {
      question: "What career services are available?",
      answer: "Our Career Development Office offers portfolio reviews, interview preparation, industry networking events, internship placement assistance, and job search support for students and recent graduates.",
      category: "careers",
      order: 1,
      created_at: now,
      updated_at: now
    },
    {
      question: "Can I take courses outside my major?",
      answer: "Yes, students are encouraged to explore courses outside their major. We offer a variety of electives and interdisciplinary opportunities to enhance your creative education.",
      category: "academics",
      order: 1,
      created_at: now,
      updated_at: now
    },
    {
      question: "Does Rahini College accept transfer students?",
      answer: "Yes, we accept transfer students on a case-by-case basis. Transfer credits are evaluated based on course content, accreditation of the previous institution, and portfolio review.",
      category: "admissions",
      order: 3,
      created_at: now,
      updated_at: now
    }
  ]);
  console.log("FAQs seeded successfully");
}

// server/index.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path4.dirname(__filename2);
var envPath2 = path4.resolve(__dirname2, "..", ".env");
var result2 = dotenv2.config({ path: envPath2 });
if (result2.error) {
  console.error("Error loading .env file:", result2.error);
  console.error("Looked for .env at path:", envPath2);
} else {
  console.log(".env file loaded successfully from:", envPath2);
  console.log("DATABASE_URL found:", process.env.DATABASE_URL ? "Yes" : "No");
}
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 150) {
        logLine = logLine.slice(0, 149) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    console.error("Unhandled Error:", err.stack || err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  if (process.env.NODE_ENV === "development") {
    log("Setting up Vite middleware for development...");
    await setupVite(app, server);
  } else {
    log("Setting up static file serving for production...");
    serveStatic(app);
  }
  const port = process.env.PORT || 5e3;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      // Listen on all available network interfaces (important for containers/deployment)
      reusePort: true
      // Allows multiple processes to bind to the same port if needed
    },
    () => {
      log(
        `Server listening on port ${port} in ${process.env.NODE_ENV || "undefined"} mode`
      );
      log("Attempting to seed database...");
      seedData().then(() => {
        log("Database seeding check complete.");
      }).catch((err) => {
        console.error("Error during database seeding:", err);
      });
    }
  );
})();

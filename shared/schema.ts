import {
  mysqlTable,
  text,
  int,
  boolean,
  timestamp,
  json,
  varchar,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session schema for express-mysql-session
export const sessions = mysqlTable("session", {
  sid: varchar("sid", { length: 255 }).notNull().primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// User schema for authentication
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  permissions: text("permissions"), // JSON string of allowed pages/modules
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

// Content schema for managing dynamic website content
export const content = mysqlTable("content", {
  id: int("id").autoincrement().primaryKey(),
  section: varchar("section", { length: 100 }).notNull(), // E.g., 'home_hero', 'about', etc.
  title: text("title"),
  subtitle: text("subtitle"),
  description: text("description"),
  image_url: text("image_url"),
  link_url: text("link_url"),
  link_text: text("link_text"),
  order: int("order").default(0),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Course schema
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // E.g., 'undergraduate', 'postgraduate', 'certificate'
  duration: varchar("duration", { length: 100 }).notNull(),
  description: text("description").notNull(),
  image_url: text("image_url"),
  is_featured: boolean("is_featured").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Department schema
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  image_url: text("image_url"),
  faculty_count: int("faculty_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Gallery schema
export const galleryItems = mysqlTable("gallery_items", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }),
  category: varchar("category", { length: 100 }).notNull(), // E.g., 'paintings', 'digital', 'sculptures', 'photography'
  image_url: text("image_url").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertGalleryItemSchema = createInsertSchema(galleryItems).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Events schema
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  end_date: timestamp("end_date"),
  location: varchar("location", { length: 255 }).notNull(),
  image_url: text("image_url"),
  category: varchar("category", { length: 100 }).default("general"),
  is_featured: boolean("is_featured").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// FAQs schema
export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }).default("general"),
  order: int("order").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Contact messages schema
export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  is_read: boolean("is_read").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(
  contactMessages
).omit({
  id: true,
  is_read: true,
  created_at: true,
});

// Newsletter subscribers schema
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  first_name: varchar("first_name", { length: 255 }),
  last_name: varchar("last_name", { length: 255 }),
  interests: text("interests"), // JSON string of interest categories
  subscription_date: timestamp("subscription_date").defaultNow(),
  is_active: boolean("is_active").default(true),
  unsubscribe_token: varchar("unsubscribe_token", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  is_active: true,
  unsubscribe_token: true,
  created_at: true,
  updated_at: true,
});

// Settings schema
export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value"),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Content = typeof content.$inferSelect;
export type InsertContent = typeof content.$inferInsert;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

export type GalleryItem = typeof galleryItems.$inferSelect;
export type InsertGalleryItem = typeof galleryItems.$inferInsert;

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = typeof faqs.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

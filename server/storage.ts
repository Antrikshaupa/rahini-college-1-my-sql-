import {
  users,
  type User,
  type InsertUser,
  content,
  type Content,
  type InsertContent,
  courses,
  type Course,
  type InsertCourse,
  departments,
  type Department,
  type InsertDepartment,
  galleryItems,
  type GalleryItem,
  type InsertGalleryItem,
  events,
  type Event,
  type InsertEvent,
  faqs,
  type FAQ,
  type InsertFAQ,
  contactMessages,
  type ContactMessage,
  type InsertContactMessage,
  subscribers,
  type Subscriber,
  type InsertSubscriber,
  settings,
} from "@shared/schema";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import { db, pool } from "./db";
import { eq, and, gte, lt, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Content
  getAllContent(): Promise<Content[]>;
  getContentBySection(section: string): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: Partial<InsertContent>): Promise<Content>;

  // Courses
  getAllCourses(): Promise<Course[]>;
  getCoursesByCategory(category: string): Promise<Course[]>;

  // Departments
  getAllDepartments(): Promise<Department[]>;

  // Gallery
  getAllGalleryItems(): Promise<GalleryItem[]>;
  getGalleryItemsByCategory(category: string): Promise<GalleryItem[]>;

  // Events
  getAllEvents(): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  getPastEvents(): Promise<Event[]>;

  // FAQs
  getAllFAQs(): Promise<FAQ[]>;

  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;

  // Newsletter Subscribers
  createSubscriber(
    subscriber: Partial<InsertSubscriber> & { unsubscribe_token?: string }
  ): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getSubscriberByToken(token: string): Promise<Subscriber | undefined>;
  updateSubscriber(id: number, data: Partial<Subscriber>): Promise<Subscriber>;
  getAllSubscribers(): Promise<Subscriber[]>;
  getActiveSubscribers(): Promise<Subscriber[]>;
  getSubscribersByIds(ids: number[]): Promise<Subscriber[]>;

  // Session Store
  sessionStore: any;

  // Settings
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;

  // User management methods
  getAllUsers(): Promise<User[]>;
  updateUserInfo(
    id: number,
    data: { username?: string; role?: string }
  ): Promise<User>;
  resetUserPassword(id: number, newPassword: string): Promise<void>;
  setUserPermissions(id: number, permissions: string[]): Promise<void>;
  createUserWithPermissions(user: {
    username: string;
    password: string;
    role: string;
    permissions: string[];
  }): Promise<User>;
}

const MySQLStoreSession = MySQLStore(session);

const sessionStore = new MySQLStoreSession({
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  createDatabaseTable: true,
});

export const storage = session({
  secret: process.env.SECRET_KEY || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
});

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = sessionStore;

    // Seed initial admin user if not exists
    this.seedAdminUser();
  }

  private async seedAdminUser() {
    try {
      const existingAdmin = await this.getUserByUsername("admin");

      if (!existingAdmin) {
        await this.createUser({
          username: "admin",
          password: "admin123", // For development only - in production, this would be hashed
          role: "admin",
        });
        console.log("Admin user created");
      }
    } catch (error) {
      console.error("Error seeding admin user:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Content methods
  async getAllContent(): Promise<Content[]> {
    return await db.select().from(content);
  }

  async getContentBySection(section: string): Promise<Content[]> {
    return await db.select().from(content).where(eq(content.section, section));
  }

  async createContent(contentData: InsertContent): Promise<Content> {
    const [newContent] = await db
      .insert(content)
      .values(contentData)
      .returning();
    return newContent;
  }

  async updateContent(
    id: number,
    contentData: Partial<InsertContent>
  ): Promise<Content> {
    const [updatedContent] = await db
      .update(content)
      .set({ ...contentData, updated_at: new Date() })
      .where(eq(content.id, id))
      .returning();

    if (!updatedContent) {
      throw new Error(`Content with id ${id} not found`);
    }

    return updatedContent;
  }

  // Course methods
  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getCoursesByCategory(category: string): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.category, category));
  }

  // Department methods
  async getAllDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  // Gallery methods
  async getAllGalleryItems(): Promise<GalleryItem[]> {
    return await db.select().from(galleryItems);
  }

  async getGalleryItemsByCategory(category: string): Promise<GalleryItem[]> {
    return await db
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.category, category));
  }

  // Event methods
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    return await db.select().from(events).where(gte(events.date, now));
  }

  async getPastEvents(): Promise<Event[]> {
    const now = new Date();
    return await db.select().from(events).where(lt(events.date, now));
  }

  // FAQ methods
  async getAllFAQs(): Promise<FAQ[]> {
    return await db.select().from(faqs);
  }

  // Contact message methods
  async createContactMessage(
    messageData: InsertContactMessage
  ): Promise<ContactMessage> {
    const [message] = await db
      .insert(contactMessages)
      .values(messageData)
      .returning();
    return message;
  }

  // Subscriber methods
  async createSubscriber(
    subscriberData: Partial<InsertSubscriber> & { unsubscribe_token?: string }
  ): Promise<Subscriber> {
    // Cast to any to handle unsubscribe_token which isn't in InsertSubscriber but is in the db schema
    const [subscriber] = await db
      .insert(subscribers)
      .values(subscriberData as any)
      .returning();
    return subscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email));
    return subscriber;
  }

  async getSubscriberByToken(token: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.unsubscribe_token, token));
    return subscriber;
  }

  async updateSubscriber(
    id: number,
    data: Partial<Subscriber>
  ): Promise<Subscriber> {
    const [updatedSubscriber] = await db
      .update(subscribers)
      .set(data)
      .where(eq(subscribers.id, id))
      .returning();

    if (!updatedSubscriber) {
      throw new Error(`Subscriber with id ${id} not found`);
    }

    return updatedSubscriber;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers);
  }

  async getActiveSubscribers(): Promise<Subscriber[]> {
    return await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.is_active, true));
  }

  async getSubscribersByIds(ids: number[]): Promise<Subscriber[]> {
    return await db
      .select()
      .from(subscribers)
      .where(
        // Using SQL IN operator via drizzle-orm's inArray method
        sql`${subscribers.id} IN (${ids.join(",")})`
      );
  }

  // Settings methods
  async getSetting(key: string): Promise<string | null> {
    const [row] = await db.select().from(settings).where(eq(settings.key, key));
    return row?.value ?? null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }

  // User management methods
  async getAllUsers() {
    return await db.select().from(users);
  }

  async updateUserInfo(id: number, data: { username?: string; role?: string }) {
    const [updated] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async resetUserPassword(id: number, newPassword: string) {
    await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, id));
  }

  async setUserPermissions(id: number, permissions: string[]) {
    await db.update(users).set({ permissions }).where(eq(users.id, id));
  }

  async createUserWithPermissions({
    username,
    password,
    role,
    permissions,
  }: {
    username: string;
    password: string;
    role: string;
    permissions: string[];
  }) {
    const [user] = await db
      .insert(users)
      .values({ username, password, role, permissions })
      .returning();
    return user;
  }
}

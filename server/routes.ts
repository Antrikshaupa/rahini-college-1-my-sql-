import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertContactMessageSchema,
  insertSubscriberSchema,
  type Subscriber,
} from "@shared/schema";
import { z } from "zod";
import path from "path";
import { setupAuth, requireAdmin } from "./auth";
import multer from "multer";
import express from "express";

const router = express.Router();

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Image upload endpoint
router.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // API routes - all prefixed with /api

  // Content endpoints
  app.get("/api/content", async (req, res) => {
    try {
      const content = await storage.getAllContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Error fetching content" });
    }
  });

  app.get("/api/content/:section", async (req, res) => {
    try {
      const { section } = req.params;
      const content = await storage.getContentBySection(section);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Error fetching content" });
    }
  });

  // Courses endpoints
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses" });
    }
  });

  app.get("/api/courses/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const courses = await storage.getCoursesByCategory(category);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses" });
    }
  });

  // Departments endpoints
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getAllDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching departments" });
    }
  });

  // Gallery endpoints
  app.get("/api/gallery", async (req, res) => {
    try {
      const gallery = await storage.getAllGalleryItems();
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ message: "Error fetching gallery items" });
    }
  });

  app.get("/api/gallery/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const gallery = await storage.getGalleryItemsByCategory(category);
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ message: "Error fetching gallery items" });
    }
  });

  // Events endpoints
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching events" });
    }
  });

  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const events = await storage.getUpcomingEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching upcoming events" });
    }
  });

  app.get("/api/events/past", async (req, res) => {
    try {
      const events = await storage.getPastEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching past events" });
    }
  });

  // FAQs endpoints
  app.get("/api/faqs", async (req, res) => {
    try {
      const faqs = await storage.getAllFAQs();
      res.json(faqs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching FAQs" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactMessageSchema.parse(req.body);
      const result = await storage.createContactMessage(contactData);
      res
        .status(201)
        .json({ message: "Message sent successfully", id: result.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid form data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error submitting contact form" });
      }
    }
  });

  // Newsletter subscription
  app.post("/api/subscribe", async (req, res) => {
    try {
      const subscriptionData = insertSubscriberSchema.parse(req.body);

      // Check if email already exists
      try {
        const existingSubscriber = await storage.getSubscriberByEmail(
          subscriptionData.email
        );
        if (existingSubscriber) {
          if (existingSubscriber.is_active) {
            return res
              .status(400)
              .json({ message: "Email is already subscribed" });
          } else {
            // Reactivate the subscription if it was previously unsubscribed
            const reactivated = await storage.updateSubscriber(
              existingSubscriber.id,
              {
                is_active: true,
                first_name: subscriptionData.first_name,
                last_name: subscriptionData.last_name,
                interests: subscriptionData.interests,
                updated_at: new Date(),
              }
            );

            // If SendGrid API key is set, send welcome back email
            if (process.env.SENDGRID_API_KEY) {
              const { sendWelcomeEmail } = await import("./utils/email");
              await sendWelcomeEmail(
                reactivated.email,
                reactivated.first_name || undefined
              );
            }

            return res.status(200).json({
              message: "Subscription reactivated successfully",
              id: reactivated.id,
            });
          }
        }
      } catch (error) {
        console.error("Error checking existing subscriber:", error);
      }

      // Generate unsubscribe token
      let unsubscribeToken: string | undefined;
      try {
        const { generateUnsubscribeToken } = await import("./utils/email");
        unsubscribeToken = generateUnsubscribeToken();
      } catch (error) {
        console.error("Error generating unsubscribe token:", error);
      }

      // Create new subscriber
      const result = await storage.createSubscriber({
        ...subscriptionData,
        unsubscribe_token: unsubscribeToken,
      });

      // If SendGrid API key is set, send welcome email
      if (process.env.SENDGRID_API_KEY) {
        try {
          const { sendWelcomeEmail } = await import("./utils/email");
          await sendWelcomeEmail(result.email, result.first_name || undefined);
        } catch (error) {
          console.error("Error sending welcome email:", error);
        }
      }

      res
        .status(201)
        .json({ message: "Subscribed successfully", id: result.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid subscription data", errors: error.errors });
      } else {
        console.error("Subscription error:", error);
        res.status(500).json({ message: "Error processing subscription" });
      }
    }
  });

  // Unsubscribe from newsletter
  app.get("/api/unsubscribe/:token", async (req, res) => {
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

      // Update subscriber to inactive
      const updated = await storage.updateSubscriber(subscriber.id, {
        is_active: false,
        updated_at: new Date(),
      });

      // If SendGrid API key is set, send unsubscribe confirmation
      if (process.env.SENDGRID_API_KEY) {
        try {
          const { sendUnsubscribeConfirmation } = await import("./utils/email");
          await sendUnsubscribeConfirmation(updated.email);
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

  // Get all subscribers (admin only)
  app.get("/api/admin/subscribers", requireAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Error fetching subscribers" });
    }
  });

  // Send newsletter (admin only)
  app.post("/api/admin/send-newsletter", requireAdmin, async (req, res) => {
    try {
      const { subject, content, recipientIds } = req.body;

      if (!subject || !content) {
        return res
          .status(400)
          .json({ message: "Subject and content are required" });
      }

      if (!process.env.SENDGRID_API_KEY) {
        return res
          .status(500)
          .json({ message: "SendGrid API key is not configured" });
      }

      let subscribers: Subscriber[] = [];

      // Get specific subscribers if recipientIds is provided, otherwise get all active subscribers
      if (
        recipientIds &&
        Array.isArray(recipientIds) &&
        recipientIds.length > 0
      ) {
        subscribers = await storage.getSubscribersByIds(recipientIds);
      } else {
        subscribers = await storage.getActiveSubscribers();
      }

      if (subscribers.length === 0) {
        return res.status(400).json({ message: "No active subscribers found" });
      }

      // Import sendNewsletterEmail function
      const { sendNewsletterEmail } = await import("./utils/email");

      // Keep track of successful and failed emails
      const results: {
        total: number;
        sent: number;
        failed: number;
        errors: Array<{ email: string; reason: string }>;
      } = {
        total: subscribers.length,
        sent: 0,
        failed: 0,
        errors: [],
      };

      // Send newsletter to each subscriber
      for (const subscriber of subscribers) {
        try {
          const success = await sendNewsletterEmail(
            subscriber.email,
            subject,
            content,
            subscriber.unsubscribe_token || ""
          );

          if (success) {
            results.sent++;
          } else {
            results.failed++;
            results.errors.push({
              email: subscriber.email,
              reason: "Send failed",
            });
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            email: subscriber.email,
            reason: String(error),
          });
        }
      }

      res.status(200).json({
        message: `Newsletter sent to ${results.sent} subscribers`,
        results,
      });
    } catch (error) {
      console.error("Error sending newsletter:", error);
      res.status(500).json({ message: "Error sending newsletter" });
    }
  });

  // Admin endpoints - require authentication and admin role
  app.post("/api/admin/content", requireAdmin, async (req, res) => {
    try {
      const contentData = req.body;
      const result = await storage.createContent(contentData);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Error creating content" });
    }
  });

  app.put("/api/admin/content/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const contentData = req.body;
      const result = await storage.updateContent(parseInt(id), contentData);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error updating content" });
    }
  });

  // Get logo URL
  app.get("/api/settings/logo", async (req, res) => {
    const url = await storage.getSetting("logo_url");
    res.json({ url });
  });

  // Set logo URL (admin only)
  app.post("/api/settings/logo", requireAdmin, async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "Missing url" });
    await storage.setSetting("logo_url", url);
    res.json({ success: true });
  });

  // List all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Edit user info (admin only)
  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { username, role } = req.body;
    const updated = await storage.updateUserInfo(Number(id), {
      username,
      role,
    });
    res.json(updated);
  });

  // Reset password (admin only)
  app.post(
    "/api/admin/users/:id/reset-password",
    requireAdmin,
    async (req, res) => {
      const { id } = req.params;
      const { newPassword } = req.body;
      await storage.resetUserPassword(Number(id), newPassword);
      res.json({ success: true });
    }
  );

  // Set subadmin permissions (admin only)
  app.put(
    "/api/admin/users/:id/permissions",
    requireAdmin,
    async (req, res) => {
      const { id } = req.params;
      const { permissions } = req.body;
      await storage.setUserPermissions(Number(id), permissions);
      res.json({ success: true });
    }
  );

  // Create subadmin (admin only)
  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    const { username, password, role, permissions } = req.body;
    const user = await storage.createUserWithPermissions({
      username,
      password,
      role,
      permissions,
    });
    res.status(201).json(user);
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}

export default router;

import { db } from "./db";
import { content, courses, departments, galleryItems, events, faqs } from "@shared/schema";

/**
 * Seed function to populate the database with initial data
 */
export async function seedData() {
  try {
    console.log("Checking for existing content...");
    
    // Check if we already have content in the database
    const existingContent = await db.select().from(content);
    if (existingContent.length > 0) {
      console.log("Database already has content, skipping seed");
      return;
    }
    
    console.log("Seeding database with initial data...");
    
    // Seed content
    await seedContent();
    
    // Seed courses
    await seedCourses();
    
    // Seed departments
    await seedDepartments();
    
    // Seed gallery items
    await seedGalleryItems();
    
    // Seed events
    await seedEvents();
    
    // Seed FAQs
    await seedFAQs();
    
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function seedContent() {
  const now = new Date();
  
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
  const now = new Date();
  
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
  const now = new Date();
  
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
  const now = new Date();
  
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
  const now = new Date();
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
      date: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
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
      date: new Date(nextMonth.getTime() + 15 * 24 * 60 * 60 * 1000),
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
  const now = new Date();
  
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
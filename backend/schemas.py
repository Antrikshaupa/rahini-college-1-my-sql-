from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Content schemas
class ContentBase(BaseModel):
    title: str
    content: str
    section: str
    slug: str
    is_published: bool = True

class ContentCreate(ContentBase):
    pass

class Content(ContentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Course schemas
class CourseBase(BaseModel):
    title: str
    description: str
    category: str
    image_url: str

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Department schemas
class DepartmentBase(BaseModel):
    name: str
    description: str
    image_url: str

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Gallery schemas
class GalleryItemBase(BaseModel):
    title: str
    description: str
    category: str
    image_url: str

class GalleryItemCreate(GalleryItemBase):
    pass

class GalleryItem(GalleryItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Event schemas
class EventBase(BaseModel):
    title: str
    description: str
    date: datetime
    location: str
    image_url: str

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Notification schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    type: str
    expiry_date: Optional[datetime] = None

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# FAQ schemas
class FAQBase(BaseModel):
    question: str
    answer: str

class FAQCreate(FAQBase):
    pass

class FAQ(FAQBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Contact schemas
class ContactMessageBase(BaseModel):
    name: str
    email: EmailStr
    message: str

class ContactMessageCreate(ContactMessageBase):
    pass

class ContactMessage(ContactMessageBase):
    id: int
    is_read: bool
    response: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Subscriber schemas
class SubscriberBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    interests: Dict[str, Any]

class SubscriberCreate(SubscriberBase):
    pass

class Subscriber(SubscriberBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ProjectBase(BaseModel):
    title: str
    description: str
    image_url: str
    project_url: str
    github_url: str
    technologies: str

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    views: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SkillBase(BaseModel):
    name: str
    category: str
    proficiency: int

class SkillCreate(SkillBase):
    pass

class Skill(SkillBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ContactBase(BaseModel):
    name: str
    email: EmailStr
    message: str

class ContactCreate(ContactBase):
    pass

class Contact(ContactBase):
    id: int
    created_at: datetime
    is_read: bool
    response: Optional[str] = None
    responded_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ContactResponse(BaseModel):
    response: str

class PageViewBase(BaseModel):
    page_path: str
    ip_address: str
    user_agent: str
    referrer: Optional[str] = None

class PageView(PageViewBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class VisitorSessionBase(BaseModel):
    session_id: str
    ip_address: str
    user_agent: str
    country: Optional[str] = None
    city: Optional[str] = None
    device_type: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None

class VisitorSession(VisitorSessionBase):
    id: int
    first_visit: datetime
    last_visit: datetime
    visit_count: int

    class Config:
        from_attributes = True

class AdminLogBase(BaseModel):
    action: str
    details: Dict

class AdminLogCreate(AdminLogBase):
    pass

class AdminLog(AdminLogBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Statistics(BaseModel):
    total_visitors: int
    unique_visitors: int
    total_page_views: int
    total_contacts: int
    total_subscribers: int
    visitor_trends: List[Dict[str, int]]
    top_pages: List[Dict[str, int]]
    device_stats: Dict[str, int]
    browser_stats: Dict[str, int]
    os_stats: Dict[str, int]
    country_stats: Dict[str, int]

# Theme settings schemas
class ThemeSettingsBase(BaseModel):
    primary_color: str
    secondary_color: str
    font_primary: str
    font_secondary: str
    logo_url: Optional[str] = None

class ThemeSettingsCreate(ThemeSettingsBase):
    pass

class ThemeSettings(ThemeSettingsBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Social media schemas
class SocialMediaBase(BaseModel):
    platform: str
    url: HttpUrl
    is_active: bool = True

class SocialMediaCreate(SocialMediaBase):
    pass

class SocialMedia(SocialMediaBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 
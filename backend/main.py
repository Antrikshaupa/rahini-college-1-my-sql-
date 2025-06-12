from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Dict, Optional
import shutil
import os
from datetime import timedelta, datetime
from . import models, schemas, auth
from .database import engine, get_db
import uuid
from dotenv import load_dotenv
import json
import csv
import io
from user_agents import parse
import geoip2.database
from geoip2.errors import AddressNotFoundError
from fastapi.security import OAuth2PasswordRequestForm
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Portfolio API",
    description="API for portfolio website with admin panel",
    version="1.0.0"
)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "public/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Middleware to track page views
@app.middleware("http")
async def track_page_views(request: Request, call_next):
    response = await call_next(request)
    
    # Skip tracking for admin routes and static files
    if not request.url.path.startswith("/admin") and not request.url.path.startswith("/static"):
        db = next(get_db())
        try:
            # Get client IP
            ip = request.client.host
            
            # Parse user agent
            user_agent = parse(request.headers.get("user-agent", ""))
            
            # Create page view record
            page_view = models.PageView(
                page_path=request.url.path,
                ip_address=ip,
                user_agent=str(user_agent),
                referrer=request.headers.get("referer")
            )
            db.add(page_view)
            
            # Update or create visitor session
            session_id = request.cookies.get("session_id", str(uuid.uuid4()))
            visitor = db.query(models.VisitorSession).filter(
                models.VisitorSession.session_id == session_id
            ).first()
            
            if visitor:
                visitor.last_visit = datetime.utcnow()
                visitor.visit_count += 1
            else:
                # Try to get location data
                try:
                    with geoip2.database.Reader('GeoLite2-City.mmdb') as reader:
                        location = reader.city(ip)
                        country = location.country.name
                        city = location.city.name
                except (AddressNotFoundError, FileNotFoundError):
                    country = None
                    city = None
                
                visitor = models.VisitorSession(
                    session_id=session_id,
                    ip_address=ip,
                    user_agent=str(user_agent),
                    country=country,
                    city=city,
                    device_type=user_agent.device.family,
                    browser=user_agent.browser.family,
                    os=user_agent.os.family
                )
                db.add(visitor)
            
            db.commit()
            
            # Set session cookie if not exists
            if "session_id" not in request.cookies:
                response.set_cookie(
                    key="session_id",
                    value=session_id,
                    max_age=30*24*60*60,  # 30 days
                    httponly=True
                )
                
        except Exception as e:
            db.rollback()
            print(f"Error tracking page view: {str(e)}")
    
    return response

# Security middleware
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    # Add security headers
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Authentication endpoints
@app.post("/api/token", response_model=auth.Token)
@limiter.limit("5/minute")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = await auth.authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth.create_tokens(user)

@app.post("/api/token/refresh", response_model=auth.Token)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    return await auth.refresh_access_token(refresh_token, db)

@app.get("/api/admin/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_admin_user)):
    return current_user

# Content management endpoints
@app.get("/api/admin/content", response_model=List[schemas.Content])
def get_all_content(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    return db.query(models.Content).all()

@app.post("/api/admin/content", response_model=schemas.Content)
def create_content(
    content: schemas.ContentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    db_content = models.Content(**content.dict())
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    
    # Log admin action
    admin_log = models.AdminLog(
        user_id=current_user.id,
        action="create_content",
        details={"content_id": db_content.id, "title": db_content.title}
    )
    db.add(admin_log)
    db.commit()
    
    return db_content

@app.put("/api/admin/content/{content_id}", response_model=schemas.Content)
def update_content(
    content_id: int,
    content: schemas.ContentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    db_content = db.query(models.Content).filter(models.Content.id == content_id).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    for key, value in content.dict().items():
        setattr(db_content, key, value)
    
    db.commit()
    db.refresh(db_content)
    
    # Log admin action
    admin_log = models.AdminLog(
        user_id=current_user.id,
        action="update_content",
        details={"content_id": content_id, "title": db_content.title}
    )
    db.add(admin_log)
    db.commit()
    
    return db_content

@app.delete("/api/admin/content/{content_id}")
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    db_content = db.query(models.Content).filter(models.Content.id == content_id).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    db.delete(db_content)
    
    # Log admin action
    admin_log = models.AdminLog(
        user_id=current_user.id,
        action="delete_content",
        details={"content_id": content_id, "title": db_content.title}
    )
    db.add(admin_log)
    db.commit()
    
    return {"message": "Content deleted successfully"}

# Gallery management endpoints
@app.get("/api/admin/gallery", response_model=List[schemas.GalleryItem])
def get_all_gallery_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    return db.query(models.GalleryItem).all()

@app.post("/api/admin/gallery", response_model=schemas.GalleryItem)
def create_gallery_item(
    gallery_item: schemas.GalleryItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    db_gallery_item = models.GalleryItem(**gallery_item.dict())
    db.add(db_gallery_item)
    db.commit()
    db.refresh(db_gallery_item)
    
    # Log admin action
    admin_log = models.AdminLog(
        user_id=current_user.id,
        action="create_gallery_item",
        details={"gallery_item_id": db_gallery_item.id, "title": db_gallery_item.title}
    )
    db.add(admin_log)
    db.commit()
    
    return db_gallery_item

# Event management endpoints
@app.get("/api/admin/events", response_model=List[schemas.Event])
def get_all_events(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    return db.query(models.Event).all()

@app.post("/api/admin/events", response_model=schemas.Event)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    db_event = models.Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    # Log admin action
    admin_log = models.AdminLog(
        user_id=current_user.id,
        action="create_event",
        details={"event_id": db_event.id, "title": db_event.title}
    )
    db.add(admin_log)
    db.commit()
    
    return db_event

# Notification management endpoints
@app.get("/api/admin/notifications", response_model=List[schemas.Notification])
def get_all_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    return db.query(models.Notification).all()

@app.post("/api/admin/notifications", response_model=schemas.Notification)
def create_notification(
    notification: schemas.NotificationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    db_notification = models.Notification(**notification.dict())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    # Log admin action
    admin_log = models.AdminLog(
        user_id=current_user.id,
        action="create_notification",
        details={"notification_id": db_notification.id, "title": db_notification.title}
    )
    db.add(admin_log)
    db.commit()
    
    return db_notification

# Theme settings endpoints
@app.get("/api/admin/theme", response_model=schemas.ThemeSettings)
def get_theme_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    settings = db.query(models.ThemeSettings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Theme settings not found")
    return settings

@app.put("/api/admin/theme", response_model=schemas.ThemeSettings)
def update_theme_settings(
    settings: schemas.ThemeSettingsCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    db_settings = db.query(models.ThemeSettings).first()
    if not db_settings:
        db_settings = models.ThemeSettings(**settings.dict())
        db.add(db_settings)
    else:
        for key, value in settings.dict().items():
            setattr(db_settings, key, value)
    
    db.commit()
    db.refresh(db_settings)
    
    # Log admin action
    admin_log = models.AdminLog(
        user_id=current_user.id,
        action="update_theme_settings",
        details={"settings_id": db_settings.id}
    )
    db.add(admin_log)
    db.commit()
    
    return db_settings

# Social media endpoints
@app.get("/api/admin/social-media", response_model=List[schemas.SocialMedia])
def get_all_social_media(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    return db.query(models.SocialMedia).all()

@app.post("/api/admin/social-media", response_model=schemas.SocialMedia)
def create_social_media(
    social_media: schemas.SocialMediaCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    db_social_media = models.SocialMedia(**social_media.dict())
    db.add(db_social_media)
    db.commit()
    db.refresh(db_social_media)
    
    # Log admin action
    admin_log = models.AdminLog(
        user_id=current_user.id,
        action="create_social_media",
        details={"social_media_id": db_social_media.id, "platform": db_social_media.platform}
    )
    db.add(admin_log)
    db.commit()
    
    return db_social_media

# File upload endpoint
@app.post("/api/admin/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return file URL
    return {"url": f"/uploads/{unique_filename}"}

# Statistics endpoint
@app.get("/api/admin/statistics", response_model=schemas.Statistics)
def get_statistics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    # Get total visitors
    total_visitors = db.query(func.count(models.VisitorSession.id)).scalar()
    
    # Get unique visitors
    unique_visitors = db.query(func.count(models.VisitorSession.session_id.distinct())).scalar()
    
    # Get total page views
    total_page_views = db.query(func.count(models.PageView.id)).scalar()
    
    # Get total contacts
    total_contacts = db.query(func.count(models.ContactMessage.id)).scalar()
    
    # Get total subscribers
    total_subscribers = db.query(func.count(models.Subscriber.id)).scalar()
    
    # Get visitor trends (last 7 days)
    visitor_trends = []
    for i in range(7):
        date = datetime.utcnow() - timedelta(days=i)
        count = db.query(func.count(models.VisitorSession.id)).filter(
            func.date(models.VisitorSession.first_visit) == date.date()
        ).scalar()
        visitor_trends.append({"date": date.date().isoformat(), "count": count})
    
    # Get top pages
    top_pages = db.query(
        models.PageView.page_path,
        func.count(models.PageView.id).label("views")
    ).group_by(models.PageView.page_path).order_by(desc("views")).limit(10).all()
    top_pages = [{"path": page[0], "views": page[1]} for page in top_pages]
    
    # Get device stats
    device_stats = db.query(
        models.VisitorSession.device_type,
        func.count(models.VisitorSession.id).label("count")
    ).group_by(models.VisitorSession.device_type).all()
    device_stats = {stat[0]: stat[1] for stat in device_stats}
    
    # Get browser stats
    browser_stats = db.query(
        models.VisitorSession.browser,
        func.count(models.VisitorSession.id).label("count")
    ).group_by(models.VisitorSession.browser).all()
    browser_stats = {stat[0]: stat[1] for stat in browser_stats}
    
    # Get OS stats
    os_stats = db.query(
        models.VisitorSession.os,
        func.count(models.VisitorSession.id).label("count")
    ).group_by(models.VisitorSession.os).all()
    os_stats = {stat[0]: stat[1] for stat in os_stats}
    
    # Get country stats
    country_stats = db.query(
        models.VisitorSession.country,
        func.count(models.VisitorSession.id).label("count")
    ).group_by(models.VisitorSession.country).all()
    country_stats = {stat[0]: stat[1] for stat in country_stats if stat[0]}
    
    return {
        "total_visitors": total_visitors,
        "unique_visitors": unique_visitors,
        "total_page_views": total_page_views,
        "total_contacts": total_contacts,
        "total_subscribers": total_subscribers,
        "visitor_trends": visitor_trends,
        "top_pages": top_pages,
        "device_stats": device_stats,
        "browser_stats": browser_stats,
        "os_stats": os_stats,
        "country_stats": country_stats
    }

# Admin endpoints
@app.get("/api/admin/dashboard/widgets")
async def get_dashboard_widgets(
    current_user: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    try:
        # Get today's date
        today = datetime.utcnow().date()
        
        # Get today's visitors
        today_visitors = db.query(models.Visitor).filter(
            models.Visitor.created_at >= today
        ).count()
        
        # Get today's page views
        today_page_views = db.query(models.PageView).filter(
            models.PageView.created_at >= today
        ).count()
        
        # Get today's new contacts
        today_contacts = db.query(models.Contact).filter(
            models.Contact.created_at >= today
        ).count()
        
        # Get visitor trends for last 7 days
        visitor_trends = []
        for i in range(7):
            date = today - timedelta(days=i)
            count = db.query(models.Visitor).filter(
                models.Visitor.created_at >= date,
                models.Visitor.created_at < date + timedelta(days=1)
            ).count()
            visitor_trends.append({
                "date": date.isoformat(),
                "count": count
            })
        visitor_trends.reverse()
        
        # Get top viewed projects
        top_projects = db.query(
            models.Project,
            models.ProjectView
        ).join(
            models.ProjectView
        ).group_by(
            models.Project.id
        ).order_by(
            models.ProjectView.count().desc()
        ).limit(5).all()
        
        # Get recent admin activities
        recent_activities = db.query(models.AdminLog).order_by(
            models.AdminLog.created_at.desc()
        ).limit(10).all()
        
        return {
            "today_stats": {
                "visitors": today_visitors,
                "page_views": today_page_views,
                "contacts": today_contacts
            },
            "visitor_trends": visitor_trends,
            "top_projects": [
                {
                    "id": project.id,
                    "title": project.title,
                    "views": views
                }
                for project, views in top_projects
            ],
            "recent_activities": [
                {
                    "id": activity.id,
                    "action": activity.action,
                    "details": activity.details,
                    "created_at": activity.created_at.isoformat()
                }
                for activity in recent_activities
            ]
        }
    except Exception as e:
        logger.error(f"Error getting dashboard widgets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting dashboard data"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
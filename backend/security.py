from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
import jwt
from typing import Optional
import os
from dotenv import load_dotenv
import re
from user_agents import parse
import ipaddress

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

class SecurityMiddleware:
    def __init__(self):
        self.security = HTTPBearer()
        self.blocked_ips = set()
        self.failed_attempts = {}
        self.max_attempts = 5
        self.block_duration = timedelta(minutes=15)
        self.suspicious_patterns = [
            r"\.\./",  # Directory traversal
            r"<script>",  # XSS
            r"UNION\s+SELECT",  # SQL Injection
            r"exec\s*\(",  # Command injection
        ]

    async def verify_token(self, request: Request) -> Optional[str]:
        try:
            auth = await self.security(request)
            token = auth.credentials
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload.get("sub")
        except Exception:
            return None

    def check_ip(self, ip: str) -> bool:
        if ip in self.blocked_ips:
            return False
        return True

    def check_suspicious_activity(self, request: Request) -> bool:
        # Check for suspicious patterns in URL and headers
        path = request.url.path
        headers = request.headers

        for pattern in self.suspicious_patterns:
            if re.search(pattern, path, re.IGNORECASE):
                return False

        # Check for suspicious user agents
        user_agent = headers.get("user-agent", "")
        if not user_agent or len(user_agent) < 5:
            return False

        return True

    def track_failed_attempt(self, ip: str):
        if ip not in self.failed_attempts:
            self.failed_attempts[ip] = {"count": 0, "timestamp": datetime.now()}
        
        self.failed_attempts[ip]["count"] += 1
        
        if self.failed_attempts[ip]["count"] >= self.max_attempts:
            self.blocked_ips.add(ip)
            self.failed_attempts[ip]["timestamp"] = datetime.now()

    def is_ip_blocked(self, ip: str) -> bool:
        if ip in self.blocked_ips:
            block_time = self.failed_attempts[ip]["timestamp"]
            if datetime.now() - block_time > self.block_duration:
                self.blocked_ips.remove(ip)
                del self.failed_attempts[ip]
                return False
            return True
        return False

    def get_client_info(self, request: Request) -> dict:
        user_agent = parse(request.headers.get("user-agent", ""))
        ip = request.client.host
        
        return {
            "ip": ip,
            "browser": user_agent.browser.family,
            "os": user_agent.os.family,
            "device": user_agent.device.family,
            "is_mobile": user_agent.is_mobile,
            "is_tablet": user_agent.is_tablet,
            "is_pc": user_agent.is_pc,
        }

    def validate_ip_range(self, ip: str) -> bool:
        try:
            ip_obj = ipaddress.ip_address(ip)
            # Add your IP range validation logic here
            return True
        except ValueError:
            return False

security_middleware = SecurityMiddleware() 
# Portfolio Website with Admin Panel

A modern portfolio website with a feature-rich admin panel built using FastAPI and React.

## Features

### Admin Panel

- Secure authentication system
- Dashboard with key metrics and statistics
- Project management (CRUD operations)
- Contact form message management
- User management
- Analytics and statistics
- Site settings and configuration
- Dark/Light theme support

### Backend

- FastAPI framework
- MySQL database
- JWT authentication
- RESTful API endpoints
- Analytics tracking
- User session management
- File upload support
- Email notifications

### Frontend

- React with TypeScript
- Material-UI components
- Responsive design
- Modern UI/UX
- Real-time updates
- Data visualization with Recharts
- Form validation
- Error handling

## Prerequisites

- Python 3.8+
- Node.js 14+
- MySQL 8.0+
- npm or yarn

## Setup

### Backend Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up MySQL database:

```sql
CREATE DATABASE portfolio_db;
CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
```

4. Create a `.env` file in the backend directory:

```
MYSQL_USER=portfolio_user
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=portfolio_db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

5. Initialize the database:

```bash
python -c "from backend.database import engine; from backend.models import Base; Base.metadata.create_all(bind=engine)"
```

6. Create an initial admin user:

```python
from backend.database import SessionLocal
from backend.models import User
from backend.auth import get_password_hash

db = SessionLocal()
admin = User(
    email="admin@example.com",
    hashed_password=get_password_hash("your_admin_password"),
    is_admin=True
)
db.add(admin)
db.commit()
```

7. Start the backend server:

```bash
uvicorn backend.main:app --reload
```

### Frontend Setup

1. Install dependencies:

```bash
cd client
npm install
```

2. Create a `.env` file in the client directory:

```
REACT_APP_API_URL=http://localhost:8000
```

3. Start the development server:

```bash
npm start
```

## Usage

1. Access the admin panel at `http://localhost:3000/admin`
2. Log in with your admin credentials
3. Navigate through the different sections:
   - Dashboard: View key metrics and statistics
   - Projects: Manage portfolio projects
   - Contacts: Handle contact form submissions
   - Analytics: View detailed visitor statistics
   - Users: Manage admin users
   - Settings: Configure site settings

## API Documentation

The API documentation is available at `http://localhost:8000/docs` when the backend server is running.

## Security Features

- JWT-based authentication
- Password hashing
- CSRF protection
- Rate limiting
- Input validation
- Secure headers
- Session management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

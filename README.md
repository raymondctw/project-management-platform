# Project Management Platform

A web-based project management platform built with FastAPI.

## Features

- Project management (create, read, update, delete)
- Task management with assignments and status tracking
- User management
- RESTful API

## Requirements

- Python 3.8+
- FastAPI
- Uvicorn
- Other dependencies listed in requirements.txt

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd project-management
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Running the Application

Start the FastAPI server with:

```
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

API documentation is automatically available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
project-management/
├── app/                # Main application package
│   ├── main.py         # FastAPI application instance
│   ├── routers/        # API routes
│   ├── models/         # Database models
│   └── schemas/        # Pydantic schemas
├── docs/               # Documentation
└── requirements.txt    # Project dependencies
```

## API Endpoints

- **Projects**
  - GET /projects - List all projects
  - POST /projects - Create a new project
  - GET /projects/{id} - Get a specific project
  - PUT /projects/{id} - Update a project
  - DELETE /projects/{id} - Delete a project

- **Tasks**
  - GET /tasks - List all tasks
  - POST /tasks - Create a new task
  - GET /tasks/{id} - Get a specific task
  - PUT /tasks/{id} - Update a task
  - DELETE /tasks/{id} - Delete a task

- **Users**
  - GET /users - List all users
  - POST /users - Create a new user
  - GET /users/{id} - Get a specific user
  - PUT /users/{id} - Update a user
  - DELETE /users/{id} - Delete a user

## Future Enhancements

- Database integration with SQLAlchemy
- Authentication and authorization
- Frontend development
- Docker containerization
- CI/CD pipeline

## Documentation

For more detailed information, see the [Project Introduction](docs/project_introduction.md) document.

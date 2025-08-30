from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from uuid import uuid4

# Import schemas later
# from app.schemas.project import Project, ProjectCreate, ProjectUpdate

router = APIRouter()

# Temporary in-memory storage
projects = []

@router.get("/", response_model=List)
async def get_projects():
    """
    Retrieve all projects.
    """
    return projects

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_project(project_data: dict):
    """
    Create a new project.
    """
    new_project = {
        "id": str(uuid4()),
        "name": project_data.get("name"),
        "description": project_data.get("description"),
        "status": project_data.get("status", "planning"),
        "created_at": project_data.get("created_at"),
    }
    projects.append(new_project)
    return new_project

@router.get("/{project_id}")
async def get_project(project_id: str):
    """
    Retrieve a specific project by ID.
    """
    for project in projects:
        if project["id"] == project_id:
            return project
    raise HTTPException(status_code=404, detail="Project not found")

@router.put("/{project_id}")
async def update_project(project_id: str, project_data: dict):
    """
    Update a specific project.
    """
    for i, project in enumerate(projects):
        if project["id"] == project_id:
            projects[i].update(project_data)
            return projects[i]
    raise HTTPException(status_code=404, detail="Project not found")

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str):
    """
    Delete a specific project.
    """
    for i, project in enumerate(projects):
        if project["id"] == project_id:
            projects.pop(i)
            return
    raise HTTPException(status_code=404, detail="Project not found")

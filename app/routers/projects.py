from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.schemas.project import Project as ProjectSchema
from app.schemas.project import ProjectCreate, ProjectUpdate

router = APIRouter()


@router.get("/", response_model=List[ProjectSchema])
async def get_projects(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Retrieve all projects.
    """
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ProjectSchema)
async def create_project(
    project_data: ProjectCreate, 
    db: Session = Depends(get_db)
):
    """
    Create a new project.
    """
    # In a real app, you would get the user ID from the token
    # For now, we'll use a default owner_id of 1
    db_project = Project(
        name=project_data.name,
        description=project_data.description,
        status=project_data.status,
        owner_id=1  # Default owner ID
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.get("/{project_id}", response_model=ProjectSchema)
async def get_project(
    project_id: int, 
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific project by ID.
    """
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project


@router.put("/{project_id}", response_model=ProjectSchema)
async def update_project(
    project_id: int, 
    project_data: ProjectUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a specific project.
    """
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int, 
    db: Session = Depends(get_db)
):
    """
    Delete a specific project.
    """
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(db_project)
    db.commit()
    return None
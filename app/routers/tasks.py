from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from uuid import uuid4

# Import schemas later
# from app.schemas.task import Task, TaskCreate, TaskUpdate

router = APIRouter()

# Temporary in-memory storage
tasks = []

@router.get("/", response_model=List)
async def get_tasks(project_id: Optional[str] = None):
    """
    Retrieve all tasks, optionally filtered by project_id.
    """
    if project_id:
        return [task for task in tasks if task["project_id"] == project_id]
    return tasks

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_task(task_data: dict):
    """
    Create a new task.
    """
    new_task = {
        "id": str(uuid4()),
        "title": task_data.get("title"),
        "description": task_data.get("description"),
        "status": task_data.get("status", "todo"),
        "priority": task_data.get("priority", "medium"),
        "project_id": task_data.get("project_id"),
        "assigned_to": task_data.get("assigned_to"),
        "due_date": task_data.get("due_date"),
    }
    tasks.append(new_task)
    return new_task

@router.get("/{task_id}")
async def get_task(task_id: str):
    """
    Retrieve a specific task by ID.
    """
    for task in tasks:
        if task["id"] == task_id:
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@router.put("/{task_id}")
async def update_task(task_id: str, task_data: dict):
    """
    Update a specific task.
    """
    for i, task in enumerate(tasks):
        if task["id"] == task_id:
            tasks[i].update(task_data)
            return tasks[i]
    raise HTTPException(status_code=404, detail="Task not found")

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str):
    """
    Delete a specific task.
    """
    for i, task in enumerate(tasks):
        if task["id"] == task_id:
            tasks.pop(i)
            return
    raise HTTPException(status_code=404, detail="Task not found")

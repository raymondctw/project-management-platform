from fastapi import APIRouter, HTTPException, status
from typing import List
from uuid import uuid4

# Import schemas later
# from app.schemas.user import User, UserCreate, UserUpdate

router = APIRouter()

# Temporary in-memory storage
users = []

@router.get("/", response_model=List)
async def get_users():
    """
    Retrieve all users.
    """
    return users

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(user_data: dict):
    """
    Create a new user.
    """
    new_user = {
        "id": str(uuid4()),
        "username": user_data.get("username"),
        "email": user_data.get("email"),
        "full_name": user_data.get("full_name"),
        "role": user_data.get("role", "member"),
    }
    users.append(new_user)
    return new_user

@router.get("/{user_id}")
async def get_user(user_id: str):
    """
    Retrieve a specific user by ID.
    """
    for user in users:
        if user["id"] == user_id:
            return user
    raise HTTPException(status_code=404, detail="User not found")

@router.put("/{user_id}")
async def update_user(user_id: str, user_data: dict):
    """
    Update a specific user.
    """
    for i, user in enumerate(users):
        if user["id"] == user_id:
            users[i].update(user_data)
            return users[i]
    raise HTTPException(status_code=404, detail="User not found")

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str):
    """
    Delete a specific user.
    """
    for i, user in enumerate(users):
        if user["id"] == user_id:
            users.pop(i)
            return
    raise HTTPException(status_code=404, detail="User not found")

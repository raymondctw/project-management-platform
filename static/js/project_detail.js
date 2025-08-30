document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    if (!token) {
        // Redirect to login if no token is found
        window.location.href = '/';
        return;
    }

    // Setup logout functionality
    setupLogout();
    
    // Load user information
    loadUserInfo();
    
    // Get project ID from URL
    const projectId = getProjectIdFromUrl();
    
    // Load project data
    loadProjectData(projectId);
    
    // Load tasks for the project
    loadProjectTasks(projectId);
    
    // Setup event listeners
    setupEventListeners(projectId);
});

function getProjectIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1];
}

function setupLogout() {
    // Add event listeners to all logout buttons/links
    document.querySelectorAll('#logout-btn, .logout-link').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear authentication data
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_type');
            
            // Redirect to login page
            window.location.href = '/';
        });
    });
}

async function loadUserInfo() {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/auth/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            // Display username in the navbar
            document.getElementById('username-display').textContent = userData.username;
            
            // Populate assignee dropdown
            populateAssigneeDropdown([userData]); // Just the current user for now
        } else {
            // If unauthorized, redirect to login
            if (response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('token_type');
                window.location.href = '/';
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

async function loadProjectData(projectId) {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const project = await response.json();
            displayProjectData(project);
        } else {
            console.error('Error loading project data');
            // Redirect to projects page if project not found
            if (response.status === 404) {
                window.location.href = '/projects';
            }
        }
    } catch (error) {
        console.error('Error loading project data:', error);
    }
}

function displayProjectData(project) {
    // Update project title
    document.getElementById('project-title').textContent = project.name;
    
    // Update project description
    document.getElementById('project-description').textContent = project.description || 'No description';
    
    // Update project status
    const statusElement = document.getElementById('project-status');
    let statusClass;
    switch (project.status) {
        case 'completed':
            statusElement.textContent = 'Completed';
            statusElement.className = 'badge bg-success';
            break;
        case 'in_progress':
            statusElement.textContent = 'In Progress';
            statusElement.className = 'badge bg-warning';
            break;
        case 'planning':
            statusElement.textContent = 'Planning';
            statusElement.className = 'badge bg-info';
            break;
        default:
            statusElement.textContent = project.status || 'Unknown';
            statusElement.className = 'badge bg-secondary';
    }
    
    // Update dates
    const startDate = project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set';
    const endDate = project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set';
    const createdDate = new Date(project.created_at).toLocaleDateString();
    
    document.getElementById('project-start-date').textContent = startDate;
    document.getElementById('project-end-date').textContent = endDate;
    document.getElementById('project-created-date').textContent = createdDate;
    
    // Update tags
    const tagsContainer = document.getElementById('project-tags');
    tagsContainer.innerHTML = '';
    
    if (project.tags) {
        const tags = project.tags.split(',');
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'badge bg-secondary me-1 project-tag';
            tagElement.textContent = tag.trim();
            tagsContainer.appendChild(tagElement);
        });
    }
    
    // Populate edit form
    document.getElementById('project-name').value = project.name;
    document.getElementById('project-description-edit').value = project.description || '';
    document.getElementById('project-status-edit').value = project.status;
    document.getElementById('project-tags-edit').value = project.tags || '';
    
    if (project.start_date) {
        const startDate = new Date(project.start_date);
        document.getElementById('project-start-date-edit').value = startDate.toISOString().split('T')[0];
    }
    
    if (project.end_date) {
        const endDate = new Date(project.end_date);
        document.getElementById('project-end-date-edit').value = endDate.toISOString().split('T')[0];
    }
}

async function loadProjectTasks(projectId) {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`/tasks/?project_id=${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const tasks = await response.json();
            displayTasks(tasks);
        } else {
            console.error('Error loading tasks');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function displayTasks(tasks) {
    // Clear task lists
    const todoList = document.getElementById('todo-tasks');
    const inProgressList = document.getElementById('in-progress-tasks');
    const doneList = document.getElementById('done-tasks');
    
    todoList.innerHTML = '';
    inProgressList.innerHTML = '';
    doneList.innerHTML = '';
    
    // Add empty state messages
    addEmptyStateMessage(todoList, 'Drop tasks here');
    addEmptyStateMessage(inProgressList, 'Drop tasks here');
    addEmptyStateMessage(doneList, 'Drop tasks here');
    
    // Sort tasks by priority (high to low)
    tasks.sort((a, b) => {
        const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
        return priorityOrder[a.priority || 'low'] - priorityOrder[b.priority || 'low'];
    });
    
    // Count tasks by status
    const taskCounts = {
        'todo': 0,
        'in_progress': 0,
        'done': 0
    };
    
    // Group tasks by status
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        
        switch (task.status) {
            case 'todo':
                todoList.appendChild(taskElement);
                taskCounts.todo++;
                break;
            case 'in_progress':
                inProgressList.appendChild(taskElement);
                taskCounts.in_progress++;
                break;
            case 'done':
                doneList.appendChild(taskElement);
                taskCounts.done++;
                break;
            default:
                todoList.appendChild(taskElement);
                taskCounts.todo++;
        }
    });
    
    // Show/hide empty state messages based on task counts
    toggleEmptyStateMessage(todoList, taskCounts.todo === 0);
    toggleEmptyStateMessage(inProgressList, taskCounts.in_progress === 0);
    toggleEmptyStateMessage(doneList, taskCounts.done === 0);
}

function addEmptyStateMessage(container, message) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-column-message';
    emptyMessage.innerHTML = `
        <i class="bi bi-inbox text-muted" style="font-size: 2rem;"></i>
        <p class="mt-2">${message}</p>
    `;
    container.appendChild(emptyMessage);
}

function toggleEmptyStateMessage(container, isEmpty) {
    const emptyMessage = container.querySelector('.empty-column-message');
    if (emptyMessage) {
        emptyMessage.style.display = isEmpty ? 'block' : 'none';
    }
}

function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'card bg-dark text-light task-card';
    taskElement.setAttribute('draggable', 'true');
    taskElement.setAttribute('data-id', task.id);
    taskElement.setAttribute('ondragstart', 'window.drag(event)');
    
    // Set priority color
    let priorityClass;
    switch (task.priority) {
        case 'high':
            priorityClass = 'border-danger';
            break;
        case 'medium':
            priorityClass = 'border-warning';
            break;
        case 'low':
            priorityClass = 'border-info';
            break;
        default:
            priorityClass = 'border-secondary';
    }
    
    taskElement.classList.add(priorityClass);
    taskElement.style.borderLeftWidth = '5px';
    
    // Format due date
    const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date';
    
    // Create task content
    taskElement.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">${task.title}</h6>
            <div>
                <span class="badge ${task.priority === 'high' ? 'bg-danger' : task.priority === 'medium' ? 'bg-warning' : 'bg-info'}">${task.priority || 'low'}</span>
            </div>
        </div>
        <div class="card-body">
            <p class="card-text small">${task.description || 'No description'}</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Due: ${dueDate}</small>
                <small class="text-muted">${task.assignee_name || 'Unassigned'}</small>
            </div>
        </div>
    `;
    
    // Add click event to edit task
    taskElement.addEventListener('click', () => {
        // Only handle click if we're not dragging
        if (!isDragging) {
            editTask(task);
        }
    });
    
    // Reset isDragging on dragend
    taskElement.addEventListener('dragend', () => {
        setTimeout(() => {
            isDragging = false;
        }, 100);
    });
    
    return taskElement;
}

function setupEventListeners(projectId) {
    // Edit project button
    document.getElementById('edit-project-btn').addEventListener('click', () => {
        const projectModal = new bootstrap.Modal(document.getElementById('projectModal'));
        projectModal.show();
    });
    
    // Save project button
    document.getElementById('save-project-btn').addEventListener('click', () => {
        saveProject(projectId);
    });
    
    // Add task buttons
    document.querySelectorAll('.add-task-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const status = e.currentTarget.getAttribute('data-status');
            showTaskModal(projectId, status);
        });
    });
    
    // Save task button
    document.getElementById('save-task-btn').addEventListener('click', () => {
        saveTask(projectId);
    });
}

function showTaskModal(projectId, status = 'todo') {
    // Reset form
    document.getElementById('task-form').reset();
    document.getElementById('task-id').value = '';
    document.getElementById('task-status').value = status;
    document.getElementById('taskModalLabel').textContent = 'New Task';
    
    // Show modal
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
    taskModal.show();
}

function editTask(task) {
    // Fill the form
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-status').value = task.status || 'todo';
    document.getElementById('task-assignee').value = task.assignee_id || '';
    document.getElementById('task-priority').value = task.priority || 'low';
    
    // Format due date for input
    if (task.due_date) {
        const dueDate = new Date(task.due_date);
        document.getElementById('task-due-date').value = dueDate.toISOString().split('T')[0];
    } else {
        document.getElementById('task-due-date').value = '';
    }
    
    // Update modal title
    document.getElementById('taskModalLabel').textContent = 'Edit Task';
    
    // Show modal
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
    taskModal.show();
}

async function saveTask(projectId) {
    const token = localStorage.getItem('access_token');
    const taskId = document.getElementById('task-id').value;
    const taskTitle = document.getElementById('task-title').value;
    const taskDescription = document.getElementById('task-description').value;
    const taskStatus = document.getElementById('task-status').value;
    const taskAssigneeId = document.getElementById('task-assignee').value;
    const taskDueDate = document.getElementById('task-due-date').value;
    const taskPriority = document.getElementById('task-priority').value;
    
    if (!taskTitle) {
        alert('Task title is required');
        return;
    }
    
    const taskData = {
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
        project_id: parseInt(projectId),
        assignee_id: taskAssigneeId ? parseInt(taskAssigneeId) : null,
        due_date: taskDueDate || null,
        priority: taskPriority
    };
    
    try {
        let url = '/tasks/';
        let method = 'POST';
        
        if (taskId) {
            // Update existing task
            url = `/tasks/${taskId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            // Close modal
            const taskModal = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
            taskModal.hide();
            
            // Reload tasks
            loadProjectTasks(projectId);
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || 'Failed to save task'}`);
        }
    } catch (error) {
        console.error('Error saving task:', error);
        alert('An error occurred while saving the task');
    }
}

async function saveProject(projectId) {
    const token = localStorage.getItem('access_token');
    const projectName = document.getElementById('project-name').value;
    const projectDescription = document.getElementById('project-description-edit').value;
    const projectStatus = document.getElementById('project-status-edit').value;
    const projectStartDate = document.getElementById('project-start-date-edit').value;
    const projectEndDate = document.getElementById('project-end-date-edit').value;
    const projectTags = document.getElementById('project-tags-edit').value;
    
    if (!projectName) {
        alert('Project name is required');
        return;
    }
    
    // Validate dates if both are provided
    if (projectStartDate && projectEndDate) {
        const startDate = new Date(projectStartDate);
        const endDate = new Date(projectEndDate);
        
        if (endDate < startDate) {
            alert('End date cannot be before start date');
            return;
        }
    }
    
    const projectData = {
        name: projectName,
        description: projectDescription,
        status: projectStatus,
        start_date: projectStartDate || null,
        end_date: projectEndDate || null,
        tags: projectTags || null
    };
    
    try {
        const response = await fetch(`/projects/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(projectData)
        });
        
        if (response.ok) {
            // Close modal
            const projectModal = bootstrap.Modal.getInstance(document.getElementById('projectModal'));
            projectModal.hide();
            
            // Reload project data
            loadProjectData(projectId);
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || 'Failed to save project'}`);
        }
    } catch (error) {
        console.error('Error saving project:', error);
        alert('An error occurred while saving the project');
    }
}

function populateAssigneeDropdown(users) {
    const assigneeSelect = document.getElementById('task-assignee');
    
    // Clear existing options except the first one
    while (assigneeSelect.options.length > 1) {
        assigneeSelect.remove(1);
    }
    
    // Add user options
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.username;
        assigneeSelect.appendChild(option);
    });
}

// Variable to track if we're dragging (to prevent click events during drag)
let isDragging = false;

// Drag and drop functions
// Make these functions global so they can be accessed by inline event handlers
window.allowDrop = function(ev) {
    ev.preventDefault();
    
    // Add visual feedback for the drop target
    let dropZone = ev.currentTarget;
    if (dropZone && dropZone.classList.contains('task-list')) {
        dropZone.classList.add('drag-over');
    }
};

// Add dragover and dragleave event handlers to all task lists
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.task-list').forEach(list => {
        list.addEventListener('dragleave', function(e) {
            this.classList.remove('drag-over');
        });
    });
});

window.drag = function(ev) {
    // Set the dragging flag
    isDragging = true;
    
    // Find the task card element (it might be a child element that was clicked)
    let taskCard = ev.target;
    while (taskCard && !taskCard.classList.contains('task-card')) {
        taskCard = taskCard.parentElement;
    }
    
    if (taskCard) {
        // Set the task ID as the data being dragged
        ev.dataTransfer.setData("taskId", taskCard.getAttribute('data-id'));
        
        // Add dragging class for visual feedback
        taskCard.classList.add('dragging');
        
        // Set dragging effect
        ev.dataTransfer.effectAllowed = 'move';
        
        // Set dragend event to remove the dragging class
        taskCard.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        }, { once: true });
    }
};

window.drop = async function(ev, status) {
    ev.preventDefault();
    
    // Get the task ID from the dragged element
    const taskId = ev.dataTransfer.getData("taskId");
    if (!taskId) {
        console.error("No task ID found in the drag data");
        return; // Exit if no task ID was found
    }
    
    // Reset the dragging flag
    isDragging = false;
    
    // Remove drag-over class from all task lists
    document.querySelectorAll('.task-list').forEach(list => {
        list.classList.remove('drag-over');
    });
    
    const token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(`/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                status: status
            })
        });
        
        if (response.ok) {
            // Reload tasks
            const projectId = getProjectIdFromUrl();
            loadProjectTasks(projectId);
        } else {
            console.error('Error updating task status');
        }
    } catch (error) {
        console.error('Error updating task status:', error);
    }
};

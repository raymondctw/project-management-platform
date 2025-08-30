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
    
    // Load projects data
    loadProjects();

    // Setup event listeners
    setupEventListeners();
});

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

async function loadProjects() {
    const token = localStorage.getItem('access_token');
    const statusFilter = document.getElementById('status-filter').value;
    const searchQuery = document.getElementById('search-projects').value.toLowerCase();
    
    try {
        // Show loading message
        const projectsContainer = document.getElementById('projects-container');
        projectsContainer.innerHTML = `
            <div class="col-12 text-center py-5 no-data-message">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading projects...</p>
            </div>
        `;
        
        // Load projects from API
        const response = await fetch('/projects/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            let projects = await response.json();
            
            // Apply filters if needed
            if (statusFilter && statusFilter !== 'all') {
                projects = projects.filter(project => project.status === statusFilter);
            }
            
            if (searchQuery) {
                projects = projects.filter(project => 
                    project.name.toLowerCase().includes(searchQuery) || 
                    (project.description && project.description.toLowerCase().includes(searchQuery)) ||
                    (project.tags && project.tags.toLowerCase().includes(searchQuery))
                );
            }
            
            // Display projects
            displayProjects(projects);
        } else {
            // Handle error
            projectsContainer.innerHTML = `
                <div class="col-12 text-center py-5 no-data-message">
                    <div class="alert alert-danger" role="alert">
                        Error loading projects
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        const projectsContainer = document.getElementById('projects-container');
        projectsContainer.innerHTML = `
            <div class="col-12 text-center py-5 no-data-message">
                <div class="alert alert-danger" role="alert">
                    Error loading projects
                </div>
            </div>
        `;
    }
}

function displayProjects(projects) {
    const projectsContainer = document.getElementById('projects-container');
    
    // Clear any existing content
    projectsContainer.innerHTML = '';
    
    if (projects.length === 0) {
        // Show no data message
        projectsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No projects found</p>
            </div>
        `;
        return;
    }
    
    // Add project cards
    projects.forEach(project => {
        // Format dates
        const createdDate = new Date(project.created_at);
        const formattedCreatedDate = createdDate.toLocaleDateString();
        
        let startDate = project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set';
        let endDate = project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set';
        
        // Create status badge
        let statusBadge, statusClass;
        switch (project.status) {
            case 'completed':
                statusBadge = '<span class="badge bg-success">Completed</span>';
                statusClass = 'border-success';
                break;
            case 'in_progress':
                statusBadge = '<span class="badge bg-warning">In Progress</span>';
                statusClass = 'border-warning';
                break;
            case 'planning':
                statusBadge = '<span class="badge bg-info">Planning</span>';
                statusClass = 'border-info';
                break;
            default:
                statusBadge = '<span class="badge bg-secondary">Unknown</span>';
                statusClass = 'border-secondary';
        }
        
        // Create tags
        const tagsHtml = project.tags ? 
            project.tags.split(',').map(tag => 
                `<span class="badge bg-secondary me-1">${tag.trim()}</span>`
            ).join('') : '';
        
        // Create project card
        const projectCol = document.createElement('div');
        projectCol.className = 'col-md-6 col-lg-4 mb-4';
        
        projectCol.innerHTML = `
            <div class="card bg-dark text-light h-100 ${statusClass} project-card" style="border-left-width: 5px; cursor: pointer;" data-id="${project.id}">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">${project.name}</h5>
                    <div>
                        ${statusBadge}
                    </div>
                </div>
                <div class="card-body">
                    <p class="card-text">${project.description || 'No description'}</p>
                    
                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-2">
                            <small class="text-muted">Start Date:</small>
                            <span>${startDate}</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <small class="text-muted">End Date:</small>
                            <span>${endDate}</span>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        ${tagsHtml ? `<div class="mb-2">${tagsHtml}</div>` : ''}
                    </div>
                </div>
                <div class="card-footer">
                    <small class="text-muted">Created: ${formattedCreatedDate}</small>
                </div>
            </div>
        `;
        
        projectsContainer.appendChild(projectCol);
    });
    
    // Add event listeners to the project cards
    addProjectCardListeners();
}

function setupEventListeners() {
    // New project button
    document.getElementById('new-project-btn').addEventListener('click', () => {
        // Reset form
        document.getElementById('project-form').reset();
        document.getElementById('project-id').value = '';
        document.getElementById('projectModalLabel').textContent = 'New Project';
        
        // Show modal
        const projectModal = new bootstrap.Modal(document.getElementById('projectModal'));
        projectModal.show();
    });
    
    // Save project button
    document.getElementById('save-project-btn').addEventListener('click', saveProject);
    
    // Filter change
    document.getElementById('status-filter').addEventListener('change', loadProjects);
    
    // Search input
    const searchInput = document.getElementById('search-projects');
    searchInput.addEventListener('keyup', debounce(loadProjects, 300));
    
    // Confirm delete button
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDeleteProject);
}

function addProjectCardListeners() {
    // Make project cards clickable
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const projectId = e.currentTarget.getAttribute('data-id');
            // Navigate to single project page
            window.location.href = `/project/${projectId}`;
        });
    });
}

async function editProject(projectId) {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const project = await response.json();
            
            // Fill the form
            document.getElementById('project-id').value = project.id;
            document.getElementById('project-name').value = project.name;
            document.getElementById('project-description').value = project.description || '';
            document.getElementById('project-status').value = project.status;
            
            // Handle dates - format to YYYY-MM-DD for date input
            if (project.start_date) {
                const startDate = new Date(project.start_date);
                document.getElementById('project-start-date').value = startDate.toISOString().split('T')[0];
            } else {
                document.getElementById('project-start-date').value = '';
            }
            
            if (project.end_date) {
                const endDate = new Date(project.end_date);
                document.getElementById('project-end-date').value = endDate.toISOString().split('T')[0];
            } else {
                document.getElementById('project-end-date').value = '';
            }
            
            // Handle tags
            document.getElementById('project-tags').value = project.tags || '';
            
            // Update modal title
            document.getElementById('projectModalLabel').textContent = 'Edit Project';
            
            // Show modal
            const projectModal = new bootstrap.Modal(document.getElementById('projectModal'));
            projectModal.show();
        } else {
            console.error('Error fetching project details');
        }
    } catch (error) {
        console.error('Error editing project:', error);
    }
}

function showDeleteConfirmation(projectId) {
    // Store the project ID to be deleted
    document.getElementById('confirm-delete-btn').setAttribute('data-id', projectId);
    
    // Show confirmation modal
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

async function saveProject() {
    const token = localStorage.getItem('access_token');
    const projectId = document.getElementById('project-id').value;
    const projectName = document.getElementById('project-name').value;
    const projectDescription = document.getElementById('project-description').value;
    const projectStatus = document.getElementById('project-status').value;
    const projectStartDate = document.getElementById('project-start-date').value;
    const projectEndDate = document.getElementById('project-end-date').value;
    const projectTags = document.getElementById('project-tags').value;
    
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
        let url = '/projects/';
        let method = 'POST';
        
        if (projectId) {
            // Update existing project
            url = `/projects/${projectId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
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
            
            // Reload projects
            loadProjects();
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || 'Failed to save project'}`);
        }
    } catch (error) {
        console.error('Error saving project:', error);
        alert('An error occurred while saving the project');
    }
}

async function confirmDeleteProject() {
    const projectId = document.getElementById('confirm-delete-btn').getAttribute('data-id');
    const token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(`/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Close modal
            const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
            deleteModal.hide();
            
            // Reload projects
            loadProjects();
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail || 'Failed to delete project'}`);
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('An error occurred while deleting the project');
    }
}

// Helper function for debouncing search input
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

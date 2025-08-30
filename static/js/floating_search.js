// Floating Search Box Functionality
document.addEventListener('DOMContentLoaded', function() {
    setupFloatingSearch();
});

function setupFloatingSearch() {
    const searchOverlay = document.getElementById('floating-search-overlay');
    const searchInput = document.getElementById('floating-search-input');
    const resultsContainer = document.getElementById('floating-search-results-container');
    
    if (!searchOverlay || !searchInput || !resultsContainer) return;
    
    // Setup keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Open search with Cmd+K or Ctrl+K
        if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            openFloatingSearch();
        }
        
        // Close search with Escape
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeFloatingSearch();
        }
    });
    
    // Close when clicking outside the search container
    searchOverlay.addEventListener('click', function(e) {
        if (e.target === searchOverlay) {
            closeFloatingSearch();
        }
    });
    
    // Setup search input
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        if (searchTerm.length > 0) {
            performFloatingSearch(searchTerm);
        } else {
            // Show empty state
            resultsContainer.innerHTML = `
                <div class="floating-search-empty-state">
                    <p>Start typing to search</p>
                    <small class="text-muted">Search for projects, tasks, and more</small>
                </div>
            `;
        }
    });
}

function openFloatingSearch() {
    const searchOverlay = document.getElementById('floating-search-overlay');
    const searchInput = document.getElementById('floating-search-input');
    
    if (!searchOverlay || !searchInput) return;
    
    // Show the overlay
    searchOverlay.classList.add('active');
    
    // Focus the input after a short delay to ensure it's visible
    setTimeout(() => {
        searchInput.focus();
    }, 100);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

function closeFloatingSearch() {
    const searchOverlay = document.getElementById('floating-search-overlay');
    const searchInput = document.getElementById('floating-search-input');
    
    if (!searchOverlay || !searchInput) return;
    
    // Hide the overlay
    searchOverlay.classList.remove('active');
    
    // Clear the input
    searchInput.value = '';
    
    // Allow body scrolling again
    document.body.style.overflow = '';
    
    // Reset results
    const resultsContainer = document.getElementById('floating-search-results-container');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="floating-search-empty-state">
                <p>Start typing to search</p>
                <small class="text-muted">Search for projects, tasks, and more</small>
            </div>
        `;
    }
}

async function performFloatingSearch(searchTerm) {
    const resultsContainer = document.getElementById('floating-search-results-container');
    if (!resultsContainer) return;
    
    // Show loading state
    resultsContainer.innerHTML = `
        <div class="floating-search-empty-state">
            <div class="spinner-border text-warning" role="status" style="width: 1.5rem; height: 1.5rem;">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Searching...</p>
        </div>
    `;
    
    try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        // Fetch projects
        const projectsResponse = await fetch('/projects/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Fetch tasks
        const tasksResponse = await fetch('/tasks/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!projectsResponse.ok || !tasksResponse.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const projects = await projectsResponse.json();
        const tasks = await tasksResponse.json();
        
        // Filter projects and tasks based on search term
        const filteredProjects = projects.filter(project => 
            project.name.toLowerCase().includes(searchTerm) || 
            (project.description && project.description.toLowerCase().includes(searchTerm)) ||
            project.status.toLowerCase().includes(searchTerm)
        );
        
        const filteredTasks = tasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) || 
            (task.description && task.description.toLowerCase().includes(searchTerm)) ||
            task.status.toLowerCase().includes(searchTerm)
        );
        
        // Render results
        renderSearchResults(filteredProjects, filteredTasks, searchTerm);
        
    } catch (error) {
        console.error('Error searching:', error);
        resultsContainer.innerHTML = `
            <div class="floating-search-no-results">
                <p>An error occurred while searching</p>
                <small class="text-muted">Please try again later</small>
            </div>
        `;
    }
}

function renderSearchResults(projects, tasks, searchTerm) {
    const resultsContainer = document.getElementById('floating-search-results-container');
    if (!resultsContainer) return;
    
    // If no results found
    if (projects.length === 0 && tasks.length === 0) {
        resultsContainer.innerHTML = `
            <div class="floating-search-no-results">
                <p>No results found for "${searchTerm}"</p>
                <small class="text-muted">Try another search term</small>
            </div>
        `;
        return;
    }
    
    // Build results HTML
    let resultsHTML = '';
    
    // Add projects section if there are projects
    if (projects.length > 0) {
        resultsHTML += `<div class="floating-search-category">Projects (${projects.length})</div>`;
        
        projects.forEach(project => {
            // Format date
            const createdDate = new Date(project.created_at);
            const formattedDate = createdDate.toLocaleDateString();
            
            // Create status badge
            let statusBadgeClass;
            switch (project.status) {
                case 'completed':
                    statusBadgeClass = 'bg-success';
                    break;
                case 'in_progress':
                    statusBadgeClass = 'bg-warning';
                    break;
                case 'planning':
                    statusBadgeClass = 'bg-info';
                    break;
                default:
                    statusBadgeClass = 'bg-secondary';
            }
            
            resultsHTML += `
                <div class="floating-search-result-item" data-type="project" data-id="${project.id}" onclick="navigateToProject(${project.id})">
                    <h5>
                        ${project.name}
                        <span class="badge ${statusBadgeClass}">${project.status}</span>
                    </h5>
                    <p>${project.description || 'No description'} • Created on ${formattedDate}</p>
                </div>
            `;
        });
    }
    
    // Add tasks section if there are tasks
    if (tasks.length > 0) {
        resultsHTML += `<div class="floating-search-category">Tasks (${tasks.length})</div>`;
        
        tasks.forEach(task => {
            // Create status badge
            let statusBadgeClass;
            switch (task.status) {
                case 'done':
                    statusBadgeClass = 'bg-success';
                    break;
                case 'in_progress':
                    statusBadgeClass = 'bg-warning';
                    break;
                case 'todo':
                    statusBadgeClass = 'bg-secondary';
                    break;
                default:
                    statusBadgeClass = 'bg-secondary';
            }
            
            resultsHTML += `
                <div class="floating-search-result-item" data-type="task" data-id="${task.id}" data-project-id="${task.project_id}" onclick="navigateToTask(${task.project_id}, ${task.id})">
                    <h5>
                        ${task.title}
                        <span class="badge ${statusBadgeClass}">${task.status}</span>
                    </h5>
                    <p>${task.description || 'No description'}</p>
                </div>
            `;
        });
    }
    
    // Update results container
    resultsContainer.innerHTML = resultsHTML;
}

// Navigation functions
function navigateToProject(projectId) {
    closeFloatingSearch();
    window.location.href = `/project/${projectId}`;
}

function navigateToTask(projectId, taskId) {
    closeFloatingSearch();
    window.location.href = `/project/${projectId}#task-${taskId}`;
}

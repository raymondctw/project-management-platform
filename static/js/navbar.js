document.addEventListener('DOMContentLoaded', function() {
    // Setup search button
    setupSearchButton();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Setup sidebar toggle
    setupSidebarToggle();
    
    // Load user information for the navbar
    loadUserInfoForNavbar();
});

// Load user information for navbar
async function loadUserInfoForNavbar() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
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

// Setup search button
function setupSearchButton() {
    const searchButton = document.getElementById('search-button');
    
    if (!searchButton) {
        console.error('Search button not found');
        return;
    }
    
    // Add click event to open floating search
    searchButton.addEventListener('click', function() {
        openFloatingSearch();
    });
}

// Search content based on current page
function searchContent(searchTerm) {
    // Determine which page we're on and search accordingly
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/dashboard')) {
        searchProjects(searchTerm);
    } else if (currentPath.includes('/projects') && !currentPath.includes('/project/')) {
        searchProjectsGrid(searchTerm);
    } else if (currentPath.includes('/project/')) {
        searchTasks(searchTerm);
    }
}

// Search projects in dashboard
function searchProjects(searchTerm) {
    const projectRows = document.querySelectorAll('#projects-table tbody tr:not(.no-data-message)');
    let hasVisibleRows = false;
    
    if (!projectRows.length) return;
    
    projectRows.forEach(row => {
        const projectName = row.querySelector('td:first-child').textContent.toLowerCase();
        const projectStatus = row.querySelector('td:nth-child(2) .badge').textContent.toLowerCase();
        
        if (projectName.includes(searchTerm) || projectStatus.includes(searchTerm)) {
            row.style.display = '';
            hasVisibleRows = true;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Show or hide no results message
    const noDataMessage = document.querySelector('#projects-table tbody .no-data-message');
    if (noDataMessage) {
        if (projectRows.length > 0 && !hasVisibleRows) {
            noDataMessage.style.display = '';
            noDataMessage.querySelector('td').textContent = `No projects found matching "${searchTerm}"`;
        } else if (!hasVisibleRows) {
            noDataMessage.style.display = '';
            noDataMessage.querySelector('td').textContent = 'No projects found';
        } else {
            noDataMessage.style.display = 'none';
        }
    }
}

// Search projects in projects grid
function searchProjectsGrid(searchTerm) {
    const projectCards = document.querySelectorAll('#projects-container .project-card');
    let hasVisibleCards = false;
    
    if (!projectCards.length) return;
    
    projectCards.forEach(card => {
        const projectName = card.querySelector('.card-title').textContent.toLowerCase();
        const projectStatus = card.querySelector('.badge').textContent.toLowerCase();
        const projectDescription = card.querySelector('.card-text').textContent.toLowerCase();
        
        if (projectName.includes(searchTerm) || 
            projectStatus.includes(searchTerm) || 
            projectDescription.includes(searchTerm)) {
            card.parentElement.style.display = '';
            hasVisibleCards = true;
        } else {
            card.parentElement.style.display = 'none';
        }
    });
    
    // Show or hide no results message
    const noDataMessage = document.querySelector('#projects-container .no-data-message');
    if (noDataMessage) {
        if (projectCards.length > 0 && !hasVisibleCards) {
            noDataMessage.style.display = 'block';
            noDataMessage.querySelector('p').textContent = `No projects found matching "${searchTerm}"`;
        } else if (!hasVisibleCards) {
            noDataMessage.style.display = 'block';
            noDataMessage.querySelector('p').textContent = 'No projects found';
        } else {
            noDataMessage.style.display = 'none';
        }
    }
}

// Search tasks in project detail
function searchTasks(searchTerm) {
    const taskCards = document.querySelectorAll('.task-card');
    
    if (!taskCards.length) return;
    
    taskCards.forEach(card => {
        const taskTitle = card.querySelector('.card-title').textContent.toLowerCase();
        const taskDescription = card.querySelector('.card-text')?.textContent.toLowerCase() || '';
        
        if (taskTitle.includes(searchTerm) || taskDescription.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Perform dropdown search across all content
async function performDropdownSearch(searchTerm) {
    console.log('Performing dropdown search for:', searchTerm);
    const searchDropdownContent = document.getElementById('search-dropdown-content');
    if (!searchDropdownContent) {
        console.error('Search dropdown content element not found');
        return;
    }
    
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
        ).slice(0, 3); // Limit to top 3 results
        
        const filteredTasks = tasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) || 
            (task.description && task.description.toLowerCase().includes(searchTerm)) ||
            task.status.toLowerCase().includes(searchTerm)
        ).slice(0, 3); // Limit to top 3 results
        
        // Render dropdown results
        renderDropdownResults(filteredProjects, filteredTasks, searchTerm);
        
    } catch (error) {
        console.error('Error searching:', error);
        searchDropdownContent.innerHTML = `
            <div class="search-dropdown-no-results">
                <p>An error occurred while searching</p>
            </div>
        `;
    }
}

// Render dropdown search results
function renderDropdownResults(projects, tasks, searchTerm) {
    console.log('Rendering dropdown results:', { projects, tasks, searchTerm });
    const searchDropdownContent = document.getElementById('search-dropdown-content');
    if (!searchDropdownContent) {
        console.error('Search dropdown content element not found for rendering');
        return;
    }
    
    // If no results found
    if (projects.length === 0 && tasks.length === 0) {
        searchDropdownContent.innerHTML = `
            <div class="text-center p-3 text-muted">
                <p>No results found for "${searchTerm}"</p>
            </div>
        `;
        return;
    }
    
    // Build results HTML
    let resultsHTML = '';
    
    // Add projects section if there are projects
    if (projects.length > 0) {
        resultsHTML += `<h6 class="dropdown-header">Projects</h6>`;
        
        projects.forEach(project => {
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
                <a class="dropdown-item" href="/project/${project.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${project.name}</span>
                        <span class="badge ${statusBadgeClass}">${project.status}</span>
                    </div>
                    <small class="text-muted">${project.description || 'No description'}</small>
                </a>
            `;
        });
    }
    
    // Add tasks section if there are tasks
    if (tasks.length > 0) {
        if (projects.length > 0) {
            resultsHTML += `<div class="dropdown-divider"></div>`;
        }
        resultsHTML += `<h6 class="dropdown-header">Tasks</h6>`;
        
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
                <a class="dropdown-item" href="/project/${task.project_id}#task-${task.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${task.title}</span>
                        <span class="badge ${statusBadgeClass}">${task.status}</span>
                    </div>
                    <small class="text-muted">${task.description || 'No description'}</small>
                </a>
            `;
        });
    }
    
    // Add footer with Cmd+K hint
    resultsHTML += `
        <div class="dropdown-divider"></div>
        <div class="dropdown-item-text text-center small text-muted">
            Press <kbd class="bg-dark">⌘K</kbd> for full search
        </div>
    `;
    
    // Update results container
    searchDropdownContent.innerHTML = resultsHTML;
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    // Focus search box when '/' key is pressed
    document.addEventListener('keydown', function(e) {
        // Ignore if typing in an input field or textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Focus search box when '/' key is pressed
        if (e.key === '/' || e.key === 'f' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
}

// Setup sidebar toggle
function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
    const sidebar = document.getElementById('sidebar');
    
    if (!sidebar) {
        return;
    }
    
    // Check if sidebar state is saved in localStorage
    const sidebarState = localStorage.getItem('sidebarState');
    if (sidebarState === 'collapsed' && window.innerWidth >= 768) {
        sidebar.classList.add('collapsed');
    }
    
    // Mobile toggle button
    if (sidebarToggle) {
        // Toggle sidebar when button is clicked
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
    
    // Desktop collapse button
    if (sidebarCollapseBtn) {
        // Toggle collapsed state when button is clicked
        sidebarCollapseBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            
            // Save state to localStorage
            if (sidebar.classList.contains('collapsed')) {
                localStorage.setItem('sidebarState', 'collapsed');
            } else {
                localStorage.setItem('sidebarState', 'expanded');
            }
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggleButton = sidebarToggle && sidebarToggle.contains(event.target);
        
        if (!isClickInsideSidebar && !isClickOnToggleButton && window.innerWidth < 768 && sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            sidebar.classList.remove('show');
        }
    });
}

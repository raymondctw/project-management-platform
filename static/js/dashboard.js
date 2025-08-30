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
    
    // Load dashboard data
    loadDashboardData();
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

// User info is now loaded from navbar.js

async function loadDashboardData() {
    const token = localStorage.getItem('access_token');
    
    try {
        // Load projects count
        const projectsResponse = await fetch('/projects/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (projectsResponse.ok) {
            const projects = await projectsResponse.json();
            document.getElementById('projects-count').textContent = projects.length;
            
            // Load projects into table
            loadProjectsTable(projects);
        }
        
        // Load tasks count
        const tasksResponse = await fetch('/tasks/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (tasksResponse.ok) {
            const tasks = await tasksResponse.json();
            document.getElementById('tasks-count').textContent = tasks.length;
        }
        
        // Load users count
        const usersResponse = await fetch('/users/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            document.getElementById('users-count').textContent = users.length;
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function loadProjectsTable(projects) {
    const tableBody = document.querySelector('#projects-table tbody');
    
    // Clear any existing rows
    tableBody.innerHTML = '';
    
    if (projects.length === 0) {
        // Show no data message
        tableBody.innerHTML = `
            <tr class="no-data-message">
                <td colspan="5" class="text-center">No projects found</td>
            </tr>
        `;
        return;
    }
    
    // Add project rows
    projects.forEach(project => {
        const row = document.createElement('tr');
        
        // Format date
        const createdDate = new Date(project.created_at);
        const formattedDate = createdDate.toLocaleDateString();
        
        // Create status badge
        let statusBadge;
        switch (project.status) {
            case 'completed':
                statusBadge = '<span class="badge bg-success">Completed</span>';
                break;
            case 'in_progress':
                statusBadge = '<span class="badge bg-warning">In Progress</span>';
                break;
            case 'planning':
                statusBadge = '<span class="badge bg-info">Planning</span>';
                break;
            default:
                statusBadge = '<span class="badge bg-secondary">Unknown</span>';
        }
        
        // Set row content
        row.innerHTML = `
            <td>${project.name}</td>
            <td>${statusBadge}</td>
            <td>0</td>
            <td>${formattedDate}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" data-id="${project.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" data-id="${project.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Search and keyboard functionality is now handled by navbar.js

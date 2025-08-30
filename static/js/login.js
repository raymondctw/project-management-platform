document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            // Hide any previous error messages
            errorMessage.classList.add('d-none');
            
            // Create form data for the API request
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            
            // Send login request
            const response = await fetch('/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });
            
            // Parse the response
            const data = await response.json();
            
            if (response.ok) {
                // Store the token in localStorage
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('token_type', data.token_type);
                
                // Redirect to dashboard
                window.location.href = '/dashboard';
            } else {
                // Show error message
                errorMessage.textContent = data.detail || 'Login failed. Please check your credentials.';
                errorMessage.classList.remove('d-none');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'An error occurred during login. Please try again.';
            errorMessage.classList.remove('d-none');
        }
    });
});

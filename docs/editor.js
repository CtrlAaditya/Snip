// Log script loading
console.log('Image editor script loaded');

// Authentication
let isAuthenticated = false;
let loadingPlayed = false;

// ImageEditor class
class ImageEditor {
    constructor() {
        console.log('Initializing ImageEditor');
        try {
            // Initialize empty properties
            this.image = null;
            this.filters = [];
            this.transform = {
                rotation: 0,
                flipX: false,
                flipY: false
            };

            // Initialize editor
            this.initializeEditor();
        } catch (error) {
            console.error('Error in ImageEditor constructor:', error);
            alert('Error initializing editor: ' + error.message);
            throw error;
        }
    }

    initializeEditor() {
        console.log('Initializing editor elements');
        try {
            // Get elements
            this.canvas = document.getElementById('editorCanvas');
            if (!this.canvas) {
                console.error('Canvas element not found');
                throw new Error('Canvas element not found');
            }

            // Get context
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                console.error('Could not get canvas context');
                throw new Error('Could not get canvas context');
            }

            console.log('Canvas initialized successfully');
            
            // Initialize canvas size
            this.resizeCanvas();
            
            // Add event listeners
            this.addEventListeners();
            
        } catch (error) {
            console.error('Error initializing editor:', error);
            throw error;
        }
    }

    resizeCanvas() {
        // Get container size
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Set canvas size to match container
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;
        
        console.log('Canvas resized to:', this.canvas.width, 'x', this.canvas.height);
    }

    addEventListeners() {
        // Add resize listener
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Add image upload listener
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (event) => this.handleImageUpload(event));
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => this.drawImage(img);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    drawImage(img) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate dimensions to fit canvas while maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        let width = this.canvas.width;
        let height = this.canvas.height;
        
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }
        
        // Draw image centered
        this.ctx.drawImage(
            img,
            (this.canvas.width - width) / 2,
            (this.canvas.height - height) / 2,
            width,
            height
        );
    }
}

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    const container = document.querySelector('.container');
    const loginForm = document.getElementById('loginForm');
    const usernameDisplay = document.getElementById('usernameDisplay');
    
    if (!loadingOverlay || !container || !loginForm || !usernameDisplay) {
        console.error('Form elements not found!');
        throw new Error('Missing required DOM elements');
    }

    console.log('Form found:', loginForm);
    console.log('Username display found:', usernameDisplay);

    // Play loading animation only once
    if (!loadingPlayed) {
        loadingOverlay.classList.add('playing');
        
        // After 2 seconds, fade out the overlay
        setTimeout(() => {
            loadingOverlay.classList.remove('playing');
            loadingOverlay.classList.add('fading');
            loadingPlayed = true;
        }, 2000);
    }

    // Check authentication on load
    checkAuthStatus();

    // Initialize editor
    try {
        new ImageEditor();
    } catch (error) {
        console.error('Error initializing editor:', error);
        alert('Error loading image editor. Please refresh the page.');
    }

    // Login form submission
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        console.log('Attempting login with:', { username: username, passwordLength: password.length });

        // For GitHub Pages, we'll use a hardcoded password check
        if (username === 'admin' && password === 'password123') {
            console.log('Login successful');
            isAuthenticated = true;
            localStorage.setItem('auth', JSON.stringify({
                authenticated: true,
                username: username
            }));
            
            loginForm.style.display = 'none';
            usernameDisplay.textContent = `Welcome, ${username}!`;
        } else {
            console.log('Login failed');
            alert('Invalid credentials. Please use:\nUsername: admin\nPassword: password123');
        }
    });
});

// Check authentication status
function checkAuthStatus() {
    console.log('Checking auth status');
    const auth = localStorage.getItem('auth');
    if (auth) {
        try {
            const authData = JSON.parse(auth);
            isAuthenticated = authData.authenticated;
            if (isAuthenticated) {
                const loginForm = document.getElementById('loginForm');
                const usernameDisplay = document.getElementById('usernameDisplay');
                if (loginForm && usernameDisplay) {
                    loginForm.style.display = 'none';
                    usernameDisplay.textContent = `Welcome, ${authData.username}!`;
                }
            }
        } catch (error) {
            console.error('Error parsing auth data:', error);
            localStorage.removeItem('auth');
        }
    }
}

// Logout function
function logout() {
    console.log('Logging out');
    localStorage.removeItem('auth');
    location.reload();
}

// Error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize editor
        new ImageEditor();
    } catch (error) {
        console.error('Error initializing editor:', error);
        alert('Error loading image editor. Please refresh the page.');
    }
});

window.onerror = function(msg, url, line, col, error) {
    console.error('Error:', msg, 'at', url, 'line:', line, 'col:', col);
    alert('An error occurred. Please check the console for details.');
    return false;
};

window.onunhandledrejection = function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    alert('An error occurred while processing your request. Please try again.');
    return false;
};

// Log script loading
console.log('Image editor script loaded');

// Authentication
let isAuthenticated = false;
let loadingPlayed = false;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    
    // Check all required elements
    const elements = {
        loadingOverlay: document.getElementById('loadingOverlay'),
        container: document.querySelector('.container'),
        loginForm: document.getElementById('loginForm'),
        usernameDisplay: document.getElementById('usernameDisplay'),
        canvas: document.getElementById('editorCanvas'),
        canvasContainer: document.querySelector('.canvas-container')
    };

    // Debug logging
    console.log('Element checks:');
    Object.entries(elements).forEach(([name, el]) => {
        console.log(`${name}:`, el ? 'Found' : 'Not found');
    });

    // Check for missing required elements
    if (Object.values(elements).some(el => !el)) {
        console.error('Missing required DOM elements!');
        throw new Error('Missing required DOM elements');
    }

    // Play loading animation only once
    if (!loadingPlayed) {
        elements.loadingOverlay.classList.add('playing');
        
        // After 2 seconds, fade out the overlay
        setTimeout(() => {
            elements.loadingOverlay.classList.remove('playing');
            elements.loadingOverlay.classList.add('fading');
            loadingPlayed = true;
        }, 2000);
    }

    // Check authentication on load
    checkAuthStatus();

    // Initialize editor
    try {
        const editor = new ImageEditor(elements);
    } catch (error) {
        console.error('Error initializing editor:', error);
        alert('Error loading image editor. Please refresh the page.');
    }

    // Login form submission
    elements.loginForm.addEventListener('submit', (event) => {
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
            
            elements.loginForm.style.display = 'none';
            elements.usernameDisplay.textContent = `Welcome, ${username}!`;
        } else {
            console.log('Login failed');
            alert('Invalid credentials. Please use:\nUsername: admin\nPassword: password123');
        }
    });
});

// ImageEditor class
class ImageEditor {
    constructor(elements) {
        console.log('Initializing ImageEditor');
        try {
            // Initialize editor
            this.initializeEditor(elements);
        } catch (error) {
            console.error('Error in ImageEditor constructor:', error);
            throw error;
        }
    }

    initializeEditor(elements) {
        console.log('Initializing editor elements');
        try {
            // Get canvas and context
            this.canvas = elements.canvas;
            this.canvasContainer = elements.canvasContainer;
            
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

            // Set canvas size
            this.setSize();
            
            // Add event listeners
            this.addEventListeners();
            
            console.log('Editor initialized successfully');
        } catch (error) {
            console.error('Error initializing editor:', error);
            throw error;
        }
    }

    setSize() {
        // Get container dimensions
        if (!this.canvasContainer) {
            throw new Error('Canvas container not found');
        }
        
        // Set canvas dimensions based on container
        const width = this.canvasContainer.clientWidth;
        const height = this.canvasContainer.clientHeight;
        
        if (width <= 0 || height <= 0) {
            console.error('Invalid container dimensions:', width, 'x', height);
            throw new Error('Invalid container dimensions');
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Ensure canvas is visible
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        
        console.log('Canvas size set to:', this.canvas.width, 'x', this.canvas.height);
    }

    addEventListeners() {
        // Add resize listener
        window.addEventListener('resize', () => this.setSize());
        
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
window.onerror = function(msg, url, line, col, error) {
    console.error('Error:', msg, 'at', url, 'line:', line, 'col:', col);
    alert('An error occurred. Please check the console for details.');
    return false;
};

window.onunhandledrejection = function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    alert('An unexpected error occurred. Please try again.');
    return false;
};

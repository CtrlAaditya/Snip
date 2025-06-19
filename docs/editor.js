// Log script loading
console.log('Image editor script loaded');

// Authentication
let isAuthenticated = false;
let loadingPlayed = false;

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
            throw error; // Re-throw to trigger the window.onerror handler
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
            
            // Initialize canvas
            this.canvas.width = 800;
            this.canvas.height = 600;

            console.log('Initializing event listeners');
            // Initialize event listeners
            this.initEventListeners();

            console.log('Editor initialized successfully');
        } catch (error) {
            console.error('Error in initializeEditor:', error);
            throw error;
        }
    }

    initEventListeners() {
        console.log('Initializing event listeners');
        try {
            // Image upload
            const fileInput = document.getElementById('imageUpload');
            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                        alert('Please select an image file');
                        e.target.value = '';
                        return;
                    }

                    // Validate file size
                    if (file.size > 10 * 1024 * 1024) {
                        alert('Image size should be less than 10MB');
                        e.target.value = '';
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.image = new Image();
                        this.image.onload = () => {
                            // Reset canvas size
                            this.canvas.width = this.image.width;
                            this.canvas.height = this.image.height;
                            
                            // Draw image
                            this.ctx.drawImage(this.image, 0, 0);
                            
                            // Reset filters and transforms
                            this.resetFilters();
                            this.resetTransforms();
                            
                            // Show preview
                            const preview = document.getElementById('preview');
                            if (preview) {
                                preview.innerHTML = `
                                    <p>Image uploaded successfully</p>
                                    <div class="preview-image">
                                        <img src="${e.target.result}" alt="Uploaded Image Preview">
                                    </div>
                                `;
                                preview.classList.add('show');
                                setTimeout(() => preview.classList.remove('show'), 3000);
                            }
                        };
                        this.image.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                });
            }

            // Basic adjustments
            const adjustmentIds = ['brightness', 'contrast', 'saturation', 'hue'];
            adjustmentIds.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('input', (e) => {
                        const value = e.target.value;
                        this.updateFilter(id, value);
                    });
                } else {
                    console.warn(`Adjustment element ${id} not found`);
                }
            });

            // Filter buttons
            const filterIds = ['grayscale', 'sepia', 'invert', 'blur', 'sharpen'];
            filterIds.forEach(id => {
                const button = document.getElementById(id);
                if (button) {
                    button.addEventListener('click', () => {
                        this.applyFilter(id);
                    });
                } else {
                    console.warn(`Filter button ${id} not found`);
                }
            });

            // Transform buttons
            const transformIds = ['rotate-left', 'rotate-right', 'flip-horizontal', 'flip-vertical'];
            transformIds.forEach(id => {
                const button = document.getElementById(id);
                if (button) {
                    button.addEventListener('click', () => {
                        switch (id) {
                            case 'rotate-left':
                                this.transform.rotation -= 90;
                                break;
                            case 'rotate-right':
                                this.transform.rotation += 90;
                                break;
                            case 'flip-horizontal':
                                this.transform.flipX = !this.transform.flipX;
                                break;
                            case 'flip-vertical':
                                this.transform.flipY = !this.transform.flipY;
                                break;
                        }
                        this.applyTransforms();
                    });
                } else {
                    console.warn(`Transform button ${id} not found`);
                }
            });

            // Download button
            const downloadButton = document.getElementById('download');
            if (downloadButton) {
                downloadButton.addEventListener('click', () => {
                    this.downloadImage();
                });
            } else {
                console.warn('Download button not found');
            }

            // Reset button
            const resetButton = document.getElementById('reset');
            if (resetButton) {
                resetButton.addEventListener('click', () => {
                    this.resetAll();
                });
            } else {
                console.warn('Reset button not found');
            }
        } catch (error) {
            console.error('Error initializing event listeners:', error);
            throw error;
        }
    }

    applyAllFilters() {
        if (!this.image) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply filters
        this.filters.forEach(filter => {
            switch (filter.type) {
                case 'grayscale':
                    this.ctx.filter = 'grayscale(100%)';
                    break;
                case 'sepia':
                    this.ctx.filter = 'sepia(100%)';
                    break;
                case 'invert':
                    this.ctx.filter = 'invert(100%)';
                    break;
                case 'blur':
                    this.ctx.filter = 'blur(5px)';
                    break;
                case 'sharpen':
                    this.ctx.filter = 'contrast(200%)';
                    break;
            }
        });

        // Draw image with filters
        this.ctx.drawImage(this.image, 0, 0);
    }

    applyTransforms() {
        if (!this.image) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Save current state
        this.ctx.save();

        // Apply transforms
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Translate to center
        this.ctx.translate(centerX, centerY);

        // Rotate
        this.ctx.rotate(this.transform.rotation * Math.PI / 180);

        // Apply flips
        if (this.transform.flipX) {
            this.ctx.scale(-1, 1);
        }
        if (this.transform.flipY) {
            this.ctx.scale(1, -1);
        }

        // Translate back
        this.ctx.translate(-centerX, -centerY);

        // Draw image with transforms
        this.ctx.drawImage(this.image, 0, 0);

        // Restore state
        this.ctx.restore();
    }

    updateFilter(filterType, value) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply filter
        switch (filterType) {
            case 'brightness':
                this.ctx.filter = `brightness(${parseInt(value) + 100}%)`;
                break;
            case 'contrast':
                this.ctx.filter = `contrast(${value}%)`;
                break;
            case 'saturation':
                this.ctx.filter = `saturate(${value}%)`;
                break;
            case 'hue':
                this.ctx.filter = `hue-rotate(${value}deg)`;
                break;
        }

        // Draw image with filter
        this.ctx.drawImage(this.image, 0, 0);
    }

    applyFilter(filterType) {
        // Toggle filter
        if (this.filters.some(f => f.type === filterType)) {
            this.filters = this.filters.filter(f => f.type !== filterType);
        } else {
            this.filters.push({ type: filterType });
        }

        // Update UI to show active filter
        const button = document.getElementById(filterType);
        if (button) {
            button.classList.toggle('active', this.filters.some(f => f.type === filterType));
        }
        
        this.applyAllFilters();
        this.applyTransforms();
    }

    resetFilters() {
        this.filters = [];
        this.ctx.filter = 'none';
        this.applyAllFilters();
    }

    resetTransforms() {
        this.transform = {
            rotation: 0,
            flipX: false,
            flipY: false
        };
        this.applyTransforms();
    }

    resetAll() {
        this.resetFilters();
        this.resetTransforms();
    }

    downloadImage() {
        if (!this.image) return;

        // Create temporary canvas for export
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.canvas.width;
        exportCanvas.height = this.canvas.height;
        const exportCtx = exportCanvas.getContext('2d');

        // Apply all filters and transforms to export canvas
        exportCtx.filter = this.ctx.filter;
        exportCtx.drawImage(this.canvas, 0, 0);

        // Create download link
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
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
        return;
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
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    isAuthenticated = authData.authenticated || false;
    
    const loginForm = document.getElementById('loginForm');
    const usernameDisplay = document.getElementById('usernameDisplay');
    
    if (!loginForm || !usernameDisplay) {
        console.error('Form elements not found in checkAuthStatus!');
        return;
    }

    console.log('Is authenticated:', isAuthenticated);
    console.log('Auth data:', authData);
    
    if (isAuthenticated) {
        loginForm.style.display = 'none';
        usernameDisplay.textContent = `Welcome, ${authData.username || 'User'}!`;
    } else {
        loginForm.style.display = 'flex';
        usernameDisplay.textContent = '';
    }
}

// Logout
function logout() {
    console.log('Logging out');
    isAuthenticated = false;
    localStorage.removeItem('auth');
    location.reload(); // Refresh to show login form again
}

// Initialize editor when DOM is ready
try {
    new ImageEditor();
} catch (error) {
    console.error('Error initializing editor:', error);
    alert('An error occurred while loading the image editor. Please check the console for details.');
}

// Add error handling for canvas
window.onerror = function(msg, url, line, col, error) {
    console.error('Error:', error);
    alert('An error occurred: ' + msg);
};

// Add error handling for unhandled promise rejections
window.onunhandledrejection = function(event) {
    console.error('Unhandled rejection:', event.reason);
    alert('An unexpected error occurred. Please try again.');
};

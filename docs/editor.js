// Log script loading
console.log('Image editor script loaded');

// Authentication
let isAuthenticated = false;
let loadingPlayed = false;

// Update debug info
function updateDebugInfo(canvasFound, containerFound) {
    const canvasStatus = document.getElementById('canvasStatus');
    const containerStatus = document.getElementById('containerStatus');
    
    if (canvasStatus) {
        canvasStatus.textContent = canvasFound ? 'Found' : 'Not found';
    }
    if (containerStatus) {
        containerStatus.textContent = containerFound ? 'Found' : 'Not found';
    }
}

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

            // Initialize properties
            this.image = null;
            this.originalImage = null;
            this.filters = {
                brightness: 0,
                contrast: 0,
                saturation: 0,
                hue: 0,
                blur: 0
            };

            // Set canvas size
            this.setSize();
            
            // Add event listeners
            this.addEventListeners();
            
            console.log('Editor initialized successfully');
            updateDebugInfo(true, true);
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
        
        // Set canvas size
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

        // Add filter listeners
        const filters = ['brightness', 'contrast', 'saturation', 'hue', 'blur'];
        filters.forEach(filter => {
            const element = document.getElementById(filter);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.filters[filter] = parseInt(e.target.value);
                    if (this.image) {
                        this.drawImage(this.image);
                    }
                });
            }
        });

        // Add flip buttons listeners
        const flipHorizontal = document.getElementById('flip-horizontal');
        if (flipHorizontal) {
            flipHorizontal.addEventListener('click', () => this.flipImage('horizontal'));
        }

        const flipVertical = document.getElementById('flip-vertical');
        if (flipVertical) {
            flipVertical.addEventListener('click', () => this.flipImage('vertical'));
        }

        const revert = document.getElementById('revert');
        if (revert) {
            revert.addEventListener('click', () => this.revertImage());
        }

        // Add reset button listener
        const resetButton = document.getElementById('reset');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetFilters());
        }

        // Add apply button listener
        const applyButton = document.getElementById('apply');
        if (applyButton) {
            applyButton.addEventListener('click', () => this.applyFilters());
        }

        // Add save button listener
        const saveButton = document.getElementById('save');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveImage());
        }
    }

    applyFilters() {
        if (!this.image) return;

        // Get current filter values
        const filters = {
            brightness: document.getElementById('brightness').value,
            contrast: document.getElementById('contrast').value,
            saturation: document.getElementById('saturation').value,
            hue: document.getElementById('hue').value,
            blur: document.getElementById('blur').value
        };

        // Update the image with these filters
        this.drawImage(this.image);
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                this.originalImage = img; // Store original image for reverting
                this.drawImage(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    flipImage(direction) {
        if (!this.image) return;

        // Create a temporary canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Set temp canvas size based on the image
        tempCanvas.width = this.image.width;
        tempCanvas.height = this.image.height;

        // Draw the original image to temp canvas
        tempCtx.drawImage(this.image, 0, 0);

        // Create a new image from the temp canvas
        const flippedImage = new Image();
        flippedImage.src = tempCanvas.toDataURL();

        // Update the image with the flipped version
        flippedImage.onload = () => {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Calculate dimensions to fit canvas while maintaining aspect ratio
            const aspectRatio = flippedImage.width / flippedImage.height;
            let width = this.canvas.width;
            let height = this.canvas.height;
            
            if (width / height > aspectRatio) {
                width = height * aspectRatio;
            } else {
                height = width / aspectRatio;
            }

            // Apply flip transformation
            this.ctx.save();
            if (direction === 'horizontal') {
                // Move to right edge and flip horizontally
                this.ctx.translate(width, 0);
                this.ctx.scale(-1, 1);
            } else if (direction === 'vertical') {
                // Move to bottom edge and flip vertically
                this.ctx.translate(0, height);
                this.ctx.scale(1, -1);
            }

            // Draw flipped image
            this.ctx.drawImage(
                flippedImage,
                (this.canvas.width - width) / 2,
                (this.canvas.height - height) / 2,
                width,
                height
            );
            this.ctx.restore();

            // Update the current image reference
            this.image = flippedImage;
        };
    }

    revertImage() {
        if (!this.originalImage) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate dimensions
        const aspectRatio = this.originalImage.width / this.originalImage.height;
        let width = this.canvas.width;
        let height = this.canvas.height;
        
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }

        // Reset filters
        this.filters = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            hue: 0,
            blur: 0
        };

        // Draw original image
        this.ctx.filter = 'none';
        this.ctx.drawImage(
            this.originalImage,
            (this.canvas.width - width) / 2,
            (this.canvas.height - height) / 2,
            width,
            height
        );

        // Reset the image reference to original
        this.image = this.originalImage;
    }

    drawImage(img) {
        if (!this.ctx) return;

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

        // Apply filters
        this.ctx.filter = `
            brightness(${this.filters.brightness + 100}%)
            contrast(${this.filters.contrast + 100}%)
            saturate(${this.filters.saturation + 100}%)
            hue-rotate(${this.filters.hue}deg)
            blur(${this.filters.blur}px)
        `;

        // Draw image with filters
        this.ctx.drawImage(
            img,
            (this.canvas.width - width) / 2,
            (this.canvas.height - height) / 2,
            width,
            height
        );
    }

    resetFilters() {
        this.filters = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            hue: 0,
            blur: 0
        };

        // Update slider values
        ['brightness', 'contrast', 'saturation', 'hue', 'blur'].forEach(filter => {
            const element = document.getElementById(filter);
            if (element) {
                element.value = 0;
            }
        });

        // Redraw image with reset filters
        if (this.image) {
            this.drawImage(this.image);
        }
    }

    saveImage() {
        if (!this.image) return;

        // Get the canvas data URL
        const dataURL = this.canvas.toDataURL();

        // Create a new link element
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'edited-image.png';

        // Simulate a click on the link
        link.click();
    }
}

// DOM Elements
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded');
    
    try {
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
                
                // After fade animation, hide completely
                setTimeout(() => {
                    elements.loadingOverlay.style.display = 'none';
                    elements.loadingOverlay.style.opacity = '0';
                    elements.loadingOverlay.style.pointerEvents = 'none';
                }, 500); // Match CSS transition time
            }, 2000);
        }

        // Check authentication on load
        await checkAuthStatus();

        // Initialize editor
        const editor = new ImageEditor(elements);

        // Login form submission
        elements.loginForm.addEventListener('submit', async (event) => {
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

    } catch (error) {
        console.error('Error initializing editor:', error);
        alert('Error loading image editor. Please refresh the page.');
    }
});

// Check authentication status
async function checkAuthStatus() {
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

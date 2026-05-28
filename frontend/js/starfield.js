class CalmingStarfield {
    constructor() {
        this.canvas = document.getElementById('starfield');
        if (!this.canvas) {
            console.error('Starfield canvas element not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseSpeedX = 0;
        this.mouseSpeedY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.cursor = null;
        
        this.config = {
            starCount: 300,
            starBaseSize: 1,
            starMaxSize: 3,
            parallaxStrength: 0.05,
            mouseInfluence: 0.15,
            trailLength: 0.8,
            calmSpeed: 0.02,
            colorShift: 0.001
        };
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createStars();
        this.setupEventListeners();
        this.createCustomCursor();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createStars() {
        this.stars = [];
        for (let i = 0; i < this.config.starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                z: Math.random() * 1000,
                size: Math.random() * (this.config.starMaxSize - this.config.starBaseSize) + this.config.starBaseSize,
                speed: Math.random() * 0.5 + 0.1,
                hue: Math.random() * 60 + 200, // Blue to purple range
                brightness: Math.random() * 0.5 + 0.5,
                twinkle: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    setupEventListeners() {
        window.addEventListener('mousemove', (e) => {
            this.mouseSpeedX = e.clientX - this.lastMouseX;
            this.mouseSpeedY = e.clientY - this.lastMouseY;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            if (this.cursor) {
                this.cursor.classList.add('active');
            }
        });
        
        window.addEventListener('mouseleave', () => {
            this.mouseSpeedX *= 0.95;
            this.mouseSpeedY *= 0.95;
            if (this.cursor) {
                this.cursor.classList.remove('active');
            }
        });
        
        window.addEventListener('resize', () => {
            this.resize();
            this.createStars();
        });
        
        // Touch support for mobile
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
            }
        }, { passive: true });
    }
    
    createCustomCursor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'cursor';
        document.body.appendChild(this.cursor);
        
        window.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
        });
    }
    
    drawStars() {
        this.ctx.fillStyle = 'rgba(12, 12, 46, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const now = Date.now();
        
        this.stars.forEach(star => {
            // Calculate parallax effect based on mouse position
            const parallaxX = (this.mouseX - centerX) * this.config.parallaxStrength * (1 - star.z / 1000);
            const parallaxY = (this.mouseY - centerY) * this.config.parallaxStrength * (1 - star.z / 1000);
            
            // Add mouse speed influence for dynamic movement
            const mouseInfluenceX = this.mouseSpeedX * this.config.mouseInfluence * (1 - star.z / 1000);
            const mouseInfluenceY = this.mouseSpeedY * this.config.mouseInfluence * (1 - star.z / 1000);
            
            // Update star position
            star.x += (parallaxX + mouseInfluenceX) * 0.01;
            star.y += (parallaxY + mouseInfluenceY) * 0.01;
            
            // Twinkle effect
            star.brightness += Math.sin(now * star.twinkle) * 0.01;
            star.brightness = Math.max(0.3, Math.min(1, star.brightness));
            
            // Color shift for calming effect
            star.hue += this.config.colorShift;
            if (star.hue > 260) star.hue = 200;
            
            // Wrap stars around screen
            if (star.x < 0) star.x = this.canvas.width;
            if (star.x > this.canvas.width) star.x = 0;
            if (star.y < 0) star.y = this.canvas.height;
            if (star.y > this.canvas.height) star.y = 0;
            
            // Draw star with gradient
            const gradient = this.ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, star.size * 2
            );
            gradient.addColorStop(0, `hsla(${star.hue}, 70%, 80%, ${star.brightness})`);
            gradient.addColorStop(1, `hsla(${star.hue}, 70%, 50%, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    animate() {
        // Smooth decay of mouse speed for calming effect
        this.mouseSpeedX *= 0.95;
        this.mouseSpeedY *= 0.95;
        
        this.drawStars();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CalmingStarfield();
});

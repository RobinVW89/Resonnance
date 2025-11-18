// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scroll with offset for fixed navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.98)';
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Form Submission Handler
const membershipForm = document.getElementById('membershipForm');

membershipForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(membershipForm);
    const data = Object.fromEntries(formData.entries());
    
    // Show success message (in a real application, this would send data to a server)
    showSuccessMessage();
    
    // Reset form
    membershipForm.reset();
});

function showSuccessMessage() {
    // Create success message element
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        color: #ffffff;
        padding: 40px 60px;
        border-radius: 15px;
        border: 2px solid #d4af37;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
        z-index: 10000;
        text-align: center;
        animation: fadeIn 0.3s ease;
    `;
    
    successMessage.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">✓</div>
        <h3 style="font-family: 'Playfair Display', serif; font-size: 28px; color: #d4af37; margin-bottom: 15px;">Candidature Envoyée</h3>
        <p style="font-size: 16px; color: #b0b0b0; margin-bottom: 25px;">Votre demande d'adhésion a été reçue avec succès.</p>
        <p style="font-size: 14px; color: #b0b0b0;">Notre équipe l'examinera et vous contactera prochainement.</p>
        <button id="closeSuccessBtn" style="
            margin-top: 30px;
            background-color: #d4af37;
            color: #0a0a0a;
            padding: 14px 35px;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: 0.3s ease;
        ">Fermer</button>
    `;
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(successMessage);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Close button functionality
    const closeBtn = document.getElementById('closeSuccessBtn');
    const closeMessage = () => {
        successMessage.remove();
        overlay.remove();
        document.body.style.overflow = 'auto';
    };
    
    closeBtn.addEventListener('click', closeMessage);
    overlay.addEventListener('click', closeMessage);
}

// Add fade-in animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
`;
document.head.appendChild(style);

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
const animatedElements = document.querySelectorAll('.value-card, .event-card, .benefit-item, .stat-card');
animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Form validation enhancement
const requiredInputs = document.querySelectorAll('input[required], textarea[required], select[required]');

requiredInputs.forEach(input => {
    input.addEventListener('blur', () => {
        if (input.value.trim() === '' || (input.type === 'select-one' && input.value === '')) {
            input.style.borderColor = '#ff4444';
        } else {
            input.style.borderColor = 'rgba(212, 175, 55, 0.3)';
        }
    });
    
    input.addEventListener('input', () => {
        if (input.value.trim() !== '' && input.style.borderColor === 'rgb(255, 68, 68)') {
            input.style.borderColor = 'rgba(212, 175, 55, 0.3)';
        }
    });
});

// Email validation
const emailInput = document.getElementById('email');
emailInput.addEventListener('blur', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value) && emailInput.value !== '') {
        emailInput.style.borderColor = '#ff4444';
    }
});

// Phone number formatting (basic French format)
const phoneInput = document.getElementById('telephone');
phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    e.target.value = value;
});

// Scroll to top button (optional enhancement)
window.addEventListener('scroll', () => {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (scrollButton) {
        if (window.pageYOffset > 500) {
            scrollButton.style.display = 'block';
        } else {
            scrollButton.style.display = 'none';
        }
    }
});

// Console message for developers
console.log('%c Résonnance ', 'background: #d4af37; color: #0a0a0a; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Club d\'Affaires Premium ', 'background: #1a1a1a; color: #d4af37; font-size: 14px; padding: 5px;');

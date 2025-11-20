// ==========================================
// RÉSONNANCE - Premium Business Club
// Interactive Features
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== Navigation ========== 
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    
    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navbar.contains(event.target);
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    // ========== Smooth Scrolling ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ========== Scroll Reveal Animation ==========
    const revealElements = document.querySelectorAll('.valeur-card, .evenement-card, .avantage-item, .process-step');
    
    function reveal() {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            
            // Element is in viewport
            if (elementTop < windowHeight - 100 && elementBottom > 0) {
                element.classList.add('reveal', 'active');
            }
        });
    }
    
    // Initial check
    reveal();
    
    // Check on scroll
    window.addEventListener('scroll', reveal);
    
    // ========== Form Handling ==========
    const adhesionForm = document.getElementById('adhesionForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (adhesionForm) {
        adhesionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const formData = new FormData(adhesionForm);
            let isValid = true;
            
            // Check required fields
            const requiredFields = adhesionForm.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#d32f2f';
                } else {
                    field.style.borderColor = '';
                }
            });
            
            // Email validation
            const emailField = document.getElementById('email');
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailField.value)) {
                isValid = false;
                emailField.style.borderColor = '#d32f2f';
            }
            
            // Phone validation (basic)
            const phoneField = document.getElementById('telephone');
            const phonePattern = /^[\d\s\+\-\(\)]+$/;
            if (!phonePattern.test(phoneField.value)) {
                isValid = false;
                phoneField.style.borderColor = '#d32f2f';
            }
            
            if (!isValid) {
                // Scroll to first error
                const firstError = adhesionForm.querySelector('[style*="border-color: rgb(211, 47, 47)"]');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            
            // Show success message
            adhesionForm.style.display = 'none';
            formSuccess.style.display = 'block';
            
            // Scroll to success message
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // In a real application, this would send data to a server
            console.log('Form submitted:', Object.fromEntries(formData));
            
            // Optional: Send to a backend API
            // fetch('/api/candidature', {
            //     method: 'POST',
            //     body: formData
            // })
            // .then(response => response.json())
            // .then(data => {
            //     console.log('Success:', data);
            // })
            // .catch((error) => {
            //     console.error('Error:', error);
            // });
        });
        
        // Reset border color on input
        const allInputs = adhesionForm.querySelectorAll('input, select, textarea');
        allInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.style.borderColor = '';
            });
        });
    }
    
    // ========== Parallax Effect on Hero ==========
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        });
    }
    
    // ========== Active Navigation Link ==========
    function setActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }
    
    window.addEventListener('scroll', setActiveNavLink);
    
    // ========== Number Counter Animation ==========
    function animateCounters() {
        const counters = document.querySelectorAll('.avantage-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const updateCounter = () => {
                            current += increment;
                            if (current < target) {
                                counter.textContent = Math.ceil(current).toString().padStart(2, '0');
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.textContent = target.toString().padStart(2, '0');
                            }
                        };
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(counter);
        });
    }
    
    animateCounters();
    
    // ========== Image Lazy Loading Enhancement ==========
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }
    
    // ========== Prevent form resubmission on page refresh ==========
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }
    
    // ========== Add subtle animations to cards ==========
    const cards = document.querySelectorAll('.valeur-card, .evenement-card, .avantage-item');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // ========== GDPR Cookie Notice (optional, commented out) ==========
    /*
    function showCookieNotice() {
        const cookieConsent = localStorage.getItem('cookieConsent');
        if (!cookieConsent) {
            // Show cookie notice
            const notice = document.createElement('div');
            notice.className = 'cookie-notice';
            notice.innerHTML = `
                <p>Ce site utilise des cookies pour améliorer votre expérience.</p>
                <button id="acceptCookies">Accepter</button>
            `;
            document.body.appendChild(notice);
            
            document.getElementById('acceptCookies').addEventListener('click', function() {
                localStorage.setItem('cookieConsent', 'true');
                notice.remove();
            });
        }
    }
    showCookieNotice();
    */
    
    // ========== Performance: Debounce scroll events ==========
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Apply debounce to scroll-heavy functions
    const debouncedReveal = debounce(reveal, 100);
    const debouncedSetActiveNavLink = debounce(setActiveNavLink, 100);
    
    window.addEventListener('scroll', debouncedReveal);
    window.addEventListener('scroll', debouncedSetActiveNavLink);
    
    // ========== Log for debugging ==========
    console.log('Résonnance website initialized successfully');
    console.log('All interactive features are active');

    // ========== Membres: chargement depuis JSON et filtrage ==========
    let members = [];

    const membersContainer = document.getElementById('membersContainer');
    const categoryFilter = document.getElementById('categoryFilter');
    const memberSearch = document.getElementById('memberSearch');

    function getCategories(list) {
        const set = new Set(list.map(m => m.category));
        return Array.from(set).sort();
    }

    function populateCategoryFilter() {
        if (!categoryFilter) return;
        const cats = getCategories(members);
        cats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            categoryFilter.appendChild(opt);
        });
    }

    function createMemberCard(member) {
        const card = document.createElement('article');
        card.className = 'member-card';

        // Photo or placeholder with initials
        const photoHtml = (member.photo && member.photo.length > 0)
            ? `<div class="member-photo"><img src="${member.photo}" alt="Photo de ${member.name}" loading="lazy"></div>`
            : (function(){
                const initials = (member.name || '').split(' ').map(s=>s[0]).filter(Boolean).slice(0,2).join('').toUpperCase();
                // derive a simple color based on category or name
                const seed = (member.category || member.name || '').charCodeAt(0) || 65;
                const colors = ['#74c69d','#ffd166','#52b788','#90e0ef','#f6bd60','#a0c4ff'];
                const color = colors[seed % colors.length];
                return `<div class="member-photo"><div class="placeholder" style="background:${color}">${initials || '?'}</div></div>`;
            })();

        card.innerHTML = `
            ${photoHtml}
            <div class="member-body">
                <h4 class="member-name">${member.name}</h4>
                <div class="member-meta">${member.role} ${member.role ? '·' : ''} <span class="member-company">${member.company || ''}</span></div>
                <div class="member-category">${member.category}</div>
                <p class="member-bio">${member.bio}</p>
                ${member.linkedin ? `<div class="member-links"><a href="${member.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="Profil LinkedIn de ${member.name}">LinkedIn</a></div>` : ''}
            </div>
        `;

        return card;
    }

    function renderMembers(list) {
        if (!membersContainer) return;
        membersContainer.innerHTML = '';
        if (list.length === 0) {
            membersContainer.innerHTML = '<p class="no-results">Aucun membre correspondant.</p>';
            return;
        }
        const frag = document.createDocumentFragment();
        list.forEach(m => frag.appendChild(createMemberCard(m)));
        membersContainer.appendChild(frag);
    }

    function filterMembers() {
        const category = categoryFilter ? categoryFilter.value : 'all';
        const query = memberSearch ? memberSearch.value.trim().toLowerCase() : '';

        let filtered = members.slice();

        if (category && category !== 'all') {
            filtered = filtered.filter(m => m.category === category);
        }

        if (query) {
            filtered = filtered.filter(m => {
                return (m.name && m.name.toLowerCase().includes(query)) ||
                       (m.company && m.company.toLowerCase().includes(query)) ||
                       (m.role && m.role.toLowerCase().includes(query)) ||
                       (m.bio && m.bio.toLowerCase().includes(query));
            });
        }

        renderMembers(filtered);
    }

    function debounce(fn, wait=200){
        let t;
        return function(...args){
            clearTimeout(t);
            t = setTimeout(()=>fn.apply(this,args), wait);
        }
    }

    if (categoryFilter) categoryFilter.addEventListener('change', filterMembers);
    if (memberSearch) memberSearch.addEventListener('input', debounce(filterMembers, 200));

    // Charge les membres depuis le fichier JSON. Fallback en console en cas d'erreur.
    fetch('data/members.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            members = data;
            populateCategoryFilter();
            renderMembers(members);
        })
        .catch(err => {
            console.error('Impossible de charger data/members.json:', err);
            // Si le fetch échoue, on affiche message et laisse la zone vide
            if (membersContainer) membersContainer.innerHTML = '<p class="no-results">Impossible de charger la liste des membres pour le moment.</p>';
        });
});

// ========== External Links ==========
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.hostname !== window.location.hostname) {
        e.target.setAttribute('rel', 'noopener noreferrer');
    }
});

// ========== Print styles helper ==========
window.addEventListener('beforeprint', function() {
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', function() {
    document.body.classList.remove('printing');
});

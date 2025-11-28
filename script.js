// ==========================================
// RÉSONANCE - Premium Business Club
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
            
            // Envoyer à Formspree
            fetch('https://formspree.io/f/xeondrya', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Show success message
                    adhesionForm.style.display = 'none';
                    formSuccess.style.display = 'block';
                    
                    // Scroll to success message
                    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Reset form
                    adhesionForm.reset();
                } else {
                    response.json().then(data => {
                        if (data.errors) {
                            alert('Erreur lors de l\'envoi du formulaire. Veuillez réessayer.');
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Erreur lors de l\'envoi du formulaire. Veuillez réessayer.');
            });
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
    console.log('Résonance website initialized successfully');
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

        // Parse bio to extract phone, email, address
        const bio = member.bio || '';
        const phoneParts = bio.match(/Tél:\s*([\d\s]+)/);
        const emailParts = bio.match(/Email:\s*([^•]+)/);
        
        let phone = phoneParts ? phoneParts[1].trim() : '';
        // Format phone if it's 10 digits without spaces (e.g., 0677724544 -> 06 77 72 45 44)
        if (phone && phone.replace(/\s/g, '').length === 10 && !/\s/.test(phone)) {
            phone = phone.match(/.{1,2}/g).join(' ');
        }
        const email = emailParts ? emailParts[1].trim() : '';
        
        // Extract only postal code from bio
        let postalCode = '';
        const postalMatch = bio.match(/(\d{5})/);
        if (postalMatch) {
            postalCode = postalMatch[1];
        }

        // Extract description (text after last •) but remove address parts
        let description = '';
        const bioSections = bio.split('•');
        if (bioSections.length > 1) {
            description = bioSections[bioSections.length - 1].trim();
            // Remove address patterns (street address, postal code + city)
            description = description.replace(/^\d+\s+[^,]+,?\s*/, ''); // Remove street address at start
            description = description.replace(/\d{5}\s+[A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎÇ][A-Za-zÀ-ÿ\-\s]+/g, ''); // Remove postal code + city
            // Remove email patterns (Email: xxx@xxx.xxx)
            description = description.replace(/Email:\s*[^\s•]+/gi, ''); // Remove email
            // Remove phone patterns (Tél: xxx)
            description = description.replace(/Tél:\s*[\d\s]+/gi, ''); // Remove phone
            description = description.trim();
        }

        // Extract full address for GPS link
        const fullAddressMatch = bio.match(/(\d+\s+[^,]+),\s*(\d{5}\s+[A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎÇ][A-Za-zÀ-ÿ\-\s]+)/);
        const hasGPSAddress = fullAddressMatch && member.company === "Plan B";

        // Build links section
        let linksHtml = '<div class="member-links">';
        if (member.website) {
            const websiteDomain = member.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
            linksHtml += `<a href="${member.website}" target="_blank" rel="noopener noreferrer" class="member-link-site" title="Visiter le site web">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span>Site web</span>
            </a>`;
        }
        if (member.linkedin) {
            linksHtml += `<a href="${member.linkedin}" target="_blank" rel="noopener noreferrer" class="member-link-linkedin" title="Voir le profil LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
            </a>`;
        }
        if (email) {
            linksHtml += `<a href="#" class="member-link-email" data-email="${email}" title="${email}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>Email</span>
            </a>`;
        }
        if (phone) {
            linksHtml += `<a href="tel:${phone.replace(/\s/g, '')}" class="member-link-phone" title="Appeler">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>${phone}</span>
            </a>`;
        }
        if (hasGPSAddress) {
            const gpsUrl = `https://www.google.com/maps/search/?api=1&query=Plan+B+Rue+de+l%27Horloge+Auxerre`;
            linksHtml += `<a href="${gpsUrl}" target="_blank" rel="noopener noreferrer" class="member-link-gps" title="Localiser sur la carte">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Accéder à sa boutique</span>
            </a>`;
        }
        linksHtml += '</div>';

        // Eldo badge if available
        let eldoBadgeHtml = '';
        if (member.eldoBadge) {
                // Extract Eldo ID from URL (e.g., clair_de_baie_auxerre)
                const eldoMatch = member.eldoUrl.match(/eldo\.com\/pro\/([^\/\?]+)/);
                const eldoId = eldoMatch ? eldoMatch[1] : null;
            
                if (eldoId) {
                    eldoBadge = `<div class="eldo-badge">
                        <iframe src="https://www.eldo.com/iframe/macaron/${eldoId}" 
                                width="200" 
                                height="200" 
                                frameborder="0" 
                                scrolling="no"
                                title="Avis Eldo"></iframe>
                    </div>`;
                }
                                <circle cx="12" cy="12" r="10"/>
                            </svg>
                            Eldo
                        </div>
                    </div>
                </a>
            `;
        }

        card.innerHTML = `
            ${photoHtml}
            <div class="member-body">
                ${eldoBadgeHtml}
                <h4 class="member-name">${member.name}</h4>
                <div class="member-company">${member.company || ''}</div>
                ${member.role ? `<div class="member-role">${member.role}</div>` : ''}
                <div class="member-category">${member.category}${postalCode ? ` • ${postalCode}` : ''}</div>
                ${description ? `<div class="member-description">${description}</div>` : ''}
                ${linksHtml}
            </div>
        `;

        return card;
    }

    function renderMembers(list) {
        if (!membersContainer) return;
        membersContainer.innerHTML = '';
        if (list.length === 0) {
            membersContainer.innerHTML = '<p class="no-results">Aucun membre trouvé.</p>';
            return;
        }
        const frag = document.createDocumentFragment();
        list.forEach(m => frag.appendChild(createMemberCard(m)));
        membersContainer.appendChild(frag);
        
        // Add click handlers for email links to show popup
        membersContainer.querySelectorAll('.member-link-email').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const email = e.currentTarget.dataset.email;
                alert(email);
            });
        });
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

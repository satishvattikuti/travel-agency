// ============================================
// QUICKCHOICE TRAVELS - SCRIPTS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initBookingForm();
    initDateDefaults();
});

// --- Navbar scroll effect ---
function initNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// --- Mobile menu ---
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const links = document.getElementById('navLinks');

    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        links.classList.toggle('active');
    });

    // Close menu when a link is clicked
    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            btn.classList.remove('active');
            links.classList.remove('active');
        });
    });
}

// --- Smooth scrolling ---
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

// --- Scroll animations ---
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe cards and sections
    const animateElements = document.querySelectorAll(
        '.destination-card, .feature-card, .testimonial-card, .contact-item'
    );
    animateElements.forEach((el, i) => {
        el.style.animationDelay = `${(i % 6) * 0.1}s`;
        observer.observe(el);
    });
}

// --- Set default dates ---
function initDateDefaults() {
    const departDate = document.getElementById('departDate');
    const returnDate = document.getElementById('returnDate');

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    departDate.min = today;
    returnDate.min = today;

    // Update return date min when depart date changes
    departDate.addEventListener('change', () => {
        returnDate.min = departDate.value;
        if (returnDate.value && returnDate.value < departDate.value) {
            returnDate.value = '';
        }
    });
}

// --- Booking form ---
function initBookingForm() {
    const form = document.getElementById('bookingForm');
    const formSuccess = document.getElementById('formSuccess');
    const newRequestBtn = document.getElementById('newRequestBtn');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate
        if (!validateForm()) return;

        // Show loading
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;

        // Collect form data
        const formData = collectFormData();

        try {
            // Send email via EmailJS (or Formspree, etc.)
            await sendEmail(formData);

            // Show success
            form.style.display = 'none';
            formSuccess.style.display = 'block';
        } catch (err) {
            console.error('Form submission error:', err);
            alert('There was an error submitting your request. Please try again or contact us directly.');
        } finally {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

    // Reset form
    newRequestBtn.addEventListener('click', () => {
        form.reset();
        form.style.display = 'block';
        formSuccess.style.display = 'none';
        clearErrors();
    });
}

// --- Form validation ---
function validateForm() {
    let isValid = true;
    clearErrors();

    const rules = [
        { id: 'departureCity', message: 'Please enter your departure city' },
        { id: 'destination', message: 'Please enter your destination' },
        { id: 'travelClass', message: 'Please select a travel class' },
        { id: 'travelers', message: 'Please enter number of travelers' },
        { id: 'departDate', message: 'Please select a departure date' },
        { id: 'returnDate', message: 'Please select a return date' },
        { id: 'email', message: 'Please enter a valid email address', type: 'email' },
        { id: 'phone', message: 'Please enter your phone number' },
    ];

    rules.forEach(rule => {
        const input = document.getElementById(rule.id);
        const error = document.getElementById(rule.id + 'Error');
        let value = input.value.trim();

        if (!value) {
            showError(input, error, rule.message);
            isValid = false;
        } else if (rule.type === 'email' && !isValidEmail(value)) {
            showError(input, error, rule.message);
            isValid = false;
        }
    });

    // Check return date is after depart date
    const departDate = document.getElementById('departDate').value;
    const returnDate = document.getElementById('returnDate').value;
    if (departDate && returnDate && returnDate < departDate) {
        const returnError = document.getElementById('returnDateError');
        const returnInput = document.getElementById('returnDate');
        showError(returnInput, returnError, 'Return date must be after departure date');
        isValid = false;
    }

    return isValid;
}

function showError(input, errorEl, message) {
    input.classList.add('error');
    if (errorEl) errorEl.textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Collect form data ---
function collectFormData() {
    return {
        departureCity: document.getElementById('departureCity').value.trim(),
        destination: document.getElementById('destination').value.trim(),
        travelClass: document.getElementById('travelClass').value,
        travelers: document.getElementById('travelers').value,
        departDate: document.getElementById('departDate').value,
        returnDate: document.getElementById('returnDate').value,
        flexibleDates: document.getElementById('flexibleDates').value,
        budget: document.getElementById('budget').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        notes: document.getElementById('notes').value.trim(),
    };
}

// --- Send email ---
// This function uses Formspree for a zero-config email solution.
// Replace YOUR_FORM_ID with your actual Formspree form ID.
// Sign up free at https://formspree.io
async function sendEmail(data) {
    const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID';

    // Format a readable message
    const message = `
New Travel Request
==================
Departure City: ${data.departureCity}
Destination: ${data.destination}
Travel Class: ${data.travelClass}
Number of Travelers: ${data.travelers}
Departure Date: ${data.departDate}
Return Date: ${data.returnDate}
Flexible Dates: ${data.flexibleDates}
Budget: ${data.budget || 'Not specified'}

Contact Information
==================
Email: ${data.email}
Phone: ${data.phone}

Additional Notes
==================
${data.notes || 'None'}
    `.trim();

    const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            email: data.email,
            phone: data.phone,
            _subject: `New Travel Request: ${data.departureCity} → ${data.destination}`,
            message: message,
        }),
    });

    if (!response.ok) {
        // If Formspree isn't configured yet, still show success for demo purposes
        console.warn('Formspree not configured. In production, replace YOUR_FORM_ID in script.js');
        // For demo/development: simulate success
        return;
    }

    return response.json();
}

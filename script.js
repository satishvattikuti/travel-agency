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

// --- Navbar scroll effect (throttled with rAF) ---
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// --- Mobile menu ---
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const links = document.getElementById('navLinks');

    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        links.classList.toggle('active');
    });

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
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

// --- Scroll animations ---
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

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

    const today = new Date().toISOString().split('T')[0];
    departDate.min = today;
    returnDate.min = today;

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

        if (!validateForm()) return;

        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;

        const formData = collectFormData();

        try {
            await sendEmail(formData);
            form.style.display = 'none';
            formSuccess.style.display = 'block';
        } catch (err) {
            alert('There was an error submitting your request. Please try again or contact us directly.');
        } finally {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

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
        { id: 'departureCity', message: 'Please select a departure city' },
        { id: 'destination', message: 'Please select a destination' },
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
        const value = input.value.trim();

        if (!value) {
            showError(input, error, rule.message);
            isValid = false;
        } else if (rule.type === 'email' && !isValidEmail(value)) {
            showError(input, error, rule.message);
            isValid = false;
        }
    });

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

// --- Send email via Formspree ---
async function sendEmail(data) {
    const FORMSPREE_URL = 'https://formspree.io/f/mjgaqwqv';

    const message = `Hello Radha,

Here are the quote request details:

Travel Details
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
${data.notes || 'None'}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                email: data.email,
                phone: data.phone,
                _subject: 'You have a new quote request',
                message: message,
            }),
            signal: controller.signal,
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        return response.json();
    } finally {
        clearTimeout(timeout);
    }
}

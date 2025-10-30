let currentSlide = 1;
const totalSlides = 18;
let isFullscreen = false;

// DOM Elements
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slideCounter = document.getElementById('slideCounter');
const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');
const menuItems = document.querySelectorAll('.menu-item');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const presentationContainer = document.querySelector('.presentation-container');
const downloadBtn = document.getElementById('downloadBtn');
const pdfLoadingOverlay = document.getElementById('pdfLoadingOverlay');
const pdfProgressFill = document.getElementById('pdfProgressFill');
const pdfLoadingStatus = document.getElementById('pdfLoadingStatus');

// Initialize
function init() {
    showSlide(currentSlide);
    updateNavigation();
    attachEventListeners();
}

// Show specific slide
function showSlide(slideNumber) {
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index + 1 === slideNumber) {
            slide.classList.add('active');
            
            // Trigger animations for cover slide
            if (slide.classList.contains('cover-slide')) {
                triggerCoverAnimations(slide);
            }
        }
    });
    
    currentSlide = slideNumber;
    updateCounter();
    updateNavigation();
    updateMenuItems();
}

// Trigger cover slide animations
function triggerCoverAnimations(coverSlide) {
    // Reset animations by removing and re-adding the active class
    const animatedElements = coverSlide.querySelectorAll('.slide-title, .slide-subtitle, .cover-divider, .cover-footer, .cover-logo, .cover-stats');
    
    animatedElements.forEach(element => {
        element.style.animation = 'none';
        // Force reflow
        element.offsetHeight;
        element.style.animation = null;
    });
}

// Update slide counter
function updateCounter() {
    slideCounter.textContent = `${currentSlide} / ${totalSlides}`;
}

// Update navigation buttons
function updateNavigation() {
    prevBtn.disabled = currentSlide === 1;
    nextBtn.disabled = currentSlide === totalSlides;
}

// Update menu items active state
function updateMenuItems() {
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.slide) === currentSlide) {
            item.classList.add('active');
        }
    });
}

// Navigate to previous slide
function previousSlide() {
    if (currentSlide > 1) {
        showSlide(currentSlide - 1);
    }
}

// Navigate to next slide
function nextSlide() {
    if (currentSlide < totalSlides) {
        showSlide(currentSlide + 1);
    }
}

// Toggle menu
function toggleMenu() {
    menuDropdown.classList.toggle('active');
}

// Close menu when clicking outside
function closeMenuOnClickOutside(event) {
    if (!menuDropdown.contains(event.target) && !menuBtn.contains(event.target)) {
        menuDropdown.classList.remove('active');
    }
}

// Toggle fullscreen mode
function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    
    if (isFullscreen) {
        presentationContainer.classList.add('fullscreen');
        document.body.classList.add('fullscreen-active');
        fullscreenBtn.textContent = '⛶';
        fullscreenBtn.title = 'Sair da tela cheia (ESC)';
        
        // Try to use browser's native fullscreen API
        if (presentationContainer.requestFullscreen) {
            presentationContainer.requestFullscreen();
        } else if (presentationContainer.webkitRequestFullscreen) {
            presentationContainer.webkitRequestFullscreen();
        } else if (presentationContainer.msRequestFullscreen) {
            presentationContainer.msRequestFullscreen();
        }
    } else {
        exitFullscreen();
    }
}

// Exit fullscreen mode
function exitFullscreen() {
    isFullscreen = false;
    presentationContainer.classList.remove('fullscreen');
    document.body.classList.remove('fullscreen-active');
    fullscreenBtn.textContent = '⛶';
    fullscreenBtn.title = 'Tela cheia (F11)';
    
    // Exit browser's native fullscreen
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Attach event listeners
function attachEventListeners() {
    // Navigation buttons
    prevBtn.addEventListener('click', previousSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    // Menu button
    menuBtn.addEventListener('click', toggleMenu);
    
    // Fullscreen button
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Download button
    downloadBtn.addEventListener('click', generatePDF);
    
    // Menu items
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const slideNumber = parseInt(item.dataset.slide);
            showSlide(slideNumber);
            menuDropdown.classList.remove('active');
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            previousSlide();
        } else if (event.key === 'ArrowRight') {
            nextSlide();
        } else if (event.key === 'Escape') {
            menuDropdown.classList.remove('active');
            if (isFullscreen) {
                exitFullscreen();
            }
        } else if (event.key === 'F11') {
            event.preventDefault();
            toggleFullscreen();
        } else if (event.key === 'f' || event.key === 'F') {
            toggleFullscreen();
        }
    });
    
    // Handle browser fullscreen change
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    // Close menu on outside click
    document.addEventListener('click', closeMenuOnClickOutside);
}

// Handle fullscreen change events from browser
function handleFullscreenChange() {
    const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
    );
    
    if (!isCurrentlyFullscreen && isFullscreen) {
        exitFullscreen();
    }
}

// Generate PDF from slides
async function generatePDF() {
    try {
        // Disable button and show loading overlay
        downloadBtn.disabled = true;
        pdfLoadingOverlay.classList.add('active');
        pdfProgressFill.style.width = '0%';
        
        // Create temporary style element to override color-mix() for PDF generation
        const pdfStyles = document.createElement('style');
        pdfStyles.id = 'pdf-temp-styles';
        pdfStyles.textContent = `
            /* Override color-mix() functions for PDF compatibility */
            .swot-count {
                background: #e8f4f8 !important;
                border-color: #c5e4ed !important;
            }
            .swot-quadrant.strengths .swot-count {
                background: #e8f5e9 !important;
                border-color: #c8e6c9 !important;
            }
            .swot-quadrant.weaknesses .swot-count {
                background: #ffebee !important;
                border-color: #ffcdd2 !important;
            }
            .swot-quadrant.opportunities .swot-count {
                background: #e3f2fd !important;
                border-color: #bbdefb !important;
            }
            .swot-quadrant.threats .swot-count {
                background: #fff3e0 !important;
                border-color: #ffe0b2 !important;
            }
            .swot-section .swot-title {
                color: var(--color-primary) !important;
            }
            .swot-section.strengths .swot-title {
                color: #2e7d32 !important;
            }
            .swot-section.weaknesses .swot-title {
                color: #c62828 !important;
            }
            .swot-section.opportunities .swot-title {
                color: #1565c0 !important;
            }
            .swot-section.threats .swot-title {
                color: #e65100 !important;
            }
            .swot-metric > span {
                background: linear-gradient(90deg, #a8d5e2 0%, #667eea 100%) !important;
            }
            
            /* Force all content visible for PDF */
            .slide-content {
                overflow: visible !important;
                max-height: none !important;
                height: auto !important;
            }
            
            .slide {
                overflow: visible !important;
                height: auto !important;
            }
            
            /* Disable animations ONLY for slides, not loading overlay */
            .slide *,
            .slide-wrapper *,
            .presentation-container * {
                animation: none !important;
                animation-delay: 0s !important;
                animation-duration: 0s !important;
                transition: none !important;
                opacity: 1 !important;
                visibility: visible !important;
                scrollbar-width: none !important;
            }
            
            .slide *::-webkit-scrollbar,
            .slide-wrapper *::-webkit-scrollbar,
            .presentation-container *::-webkit-scrollbar {
                display: none !important;
            }
            
            /* Ensure cover slide elements are visible */
            .cover-slide .slide-title,
            .cover-slide .slide-subtitle,
            .cover-slide .cover-divider,
            .cover-slide .cover-footer,
            .cover-slide .cover-logo,
            .cover-slide .cover-stats,
            .cover-slide .cover-authors {
                opacity: 1 !important;
                visibility: visible !important;
                display: flex !important;
            }
            
            .cover-stats {
                display: grid !important;
            }
            
            .cover-authors-grid {
                display: grid !important;
            }
        `;
        document.head.appendChild(pdfStyles);
        
        // Get jsPDF
        const { jsPDF } = window.jspdf;
        
        // Create new PDF
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [1920, 1080],
            compress: true
        });
        
        const slideElements = Array.from(slides);
        const totalSlidesCount = slideElements.length;
        let isFirstPage = true;
        
        for (let i = 0; i < slideElements.length; i++) {
            const slideElement = slideElements[i];
            const slideNumber = i + 1;
            
            // Update progress
            const progress = ((i) / totalSlidesCount) * 100;
            pdfProgressFill.style.width = `${progress}%`;
            pdfLoadingStatus.textContent = `Processando slide ${slideNumber} de ${totalSlidesCount}...`;
            
            // Wait a bit for UI update and rendering
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Store original styles
            const originalStyles = {
                display: slideElement.style.display,
                position: slideElement.style.position,
                zIndex: slideElement.style.zIndex,
                overflow: slideElement.style.overflow,
                height: slideElement.style.height
            };
            
            // Temporarily show the slide and prepare for capture
            const wasActive = slideElement.classList.contains('active');
            slideElement.classList.add('active');
            slideElement.style.display = 'flex';
            slideElement.style.position = 'relative';
            slideElement.style.zIndex = '9999';
            slideElement.style.overflow = 'visible';
            slideElement.style.height = 'auto';
            
            // Force layout recalculation
            slideElement.offsetHeight;
            
            // Wait for animations and content to render
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Get actual content dimensions including scrollable content
            const slideContent = slideElement.querySelector('.slide-content');
            const slideHeader = slideElement.querySelector('.slide-header');
            
            // Calculate total content height (including overflow)
            let totalHeight = slideElement.scrollHeight;
            
            // Ensure minimum height for 16:9 ratio
            const minHeight = 1080;
            const slideHeight = Math.max(minHeight, totalHeight);
            const slideWidth = 1920;
            
            // Create a temporary container for proper rendering
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'fixed';
            tempContainer.style.top = '0';
            tempContainer.style.left = '-9999px';
            tempContainer.style.width = slideWidth + 'px';
            tempContainer.style.height = slideHeight + 'px';
            tempContainer.style.overflow = 'visible';
            tempContainer.style.background = 'white';
            
            // Clone the slide
            const clonedSlide = slideElement.cloneNode(true);
            clonedSlide.style.width = '100%';
            clonedSlide.style.height = '100%';
            clonedSlide.style.overflow = 'visible';
            clonedSlide.style.display = 'flex';
            
            // Force all child elements to be visible
            const allElements = clonedSlide.querySelectorAll('*');
            allElements.forEach(el => {
                el.style.opacity = '1';
                el.style.visibility = 'visible';
                el.style.animation = 'none';
                el.style.transition = 'none';
            });
            
            tempContainer.appendChild(clonedSlide);
            document.body.appendChild(tempContainer);
            
            // Wait for clone to render
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Render slide to canvas with proper dimensions
            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: slideWidth,
                height: slideHeight,
                windowWidth: slideWidth,
                windowHeight: slideHeight,
                scrollY: 0,
                scrollX: 0,
                logging: false,
                onclone: (clonedDoc) => {
                    // Ensure all elements are visible in clone
                    const clonedElements = clonedDoc.querySelectorAll('.slide-content, .slide');
                    clonedElements.forEach(el => {
                        el.style.overflow = 'visible';
                        el.style.maxHeight = 'none';
                        el.style.height = 'auto';
                    });
                }
            });
            
            // Remove temporary container
            document.body.removeChild(tempContainer);
            
            // Restore original slide state
            if (!wasActive) {
                slideElement.classList.remove('active');
            }
            Object.keys(originalStyles).forEach(key => {
                slideElement.style[key] = originalStyles[key];
            });
            
            // Convert canvas to image
            const imgData = canvas.toDataURL('image/png', 1.0);
            
            // Calculate PDF page dimensions
            const pdfWidth = slideWidth;
            const pdfHeight = slideHeight;
            
            // Add new page if not first slide
            if (!isFirstPage) {
                pdf.addPage([pdfWidth, pdfHeight], 'landscape');
            } else {
                // Set the size of the first page
                pdf.internal.pageSize.width = pdfWidth;
                pdf.internal.pageSize.height = pdfHeight;
                isFirstPage = false;
            }
            
            // Add image to PDF filling the entire page
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
        }
        
        // Remove temporary styles
        const tempStyles = document.getElementById('pdf-temp-styles');
        if (tempStyles) {
            tempStyles.remove();
        }
        
        // Final progress update
        pdfProgressFill.style.width = '100%';
        pdfLoadingStatus.textContent = 'Finalizando PDF...';
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Save PDF
        pdf.save('ACE-Consultoria-Apresentacao.pdf');
        
        // Hide loading overlay
        setTimeout(() => {
            pdfLoadingOverlay.classList.remove('active');
            downloadBtn.disabled = false;
            pdfProgressFill.style.width = '0%';
            pdfLoadingStatus.textContent = 'Preparando slides...';
        }, 800);
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar PDF. Por favor, tente novamente.');
        
        // Remove temporary styles if error occurs
        const tempStyles = document.getElementById('pdf-temp-styles');
        if (tempStyles) {
            tempStyles.remove();
        }
        
        pdfLoadingOverlay.classList.remove('active');
        downloadBtn.disabled = false;
        pdfProgressFill.style.width = '0%';
        pdfLoadingStatus.textContent = 'Preparando slides...';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

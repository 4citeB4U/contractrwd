/**
 * Main Application Logic
 * Coordinates the contract signing workflow
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load contract template
    const contractPreviewEl = document.getElementById('contract-preview');
    if (contractPreviewEl) {
        contractPreviewEl.innerHTML = contractTemplate.getHTML();
    }
    // DOM Elements
    const contractForm = document.getElementById('contract-form');
    const signaturePad = document.getElementById('signature-pad');
    const clearButton = document.getElementById('clear-signature');
    const undoButton = document.getElementById('undo-signature');
    const submitButton = document.getElementById('submit-button');
    const loadingIndicator = document.getElementById('loading');
    const successMessage = document.getElementById('success-message');
    const downloadButton = document.getElementById('download-contract');
    
    // Signature Method Elements
    const drawSignatureRadio = document.getElementById('draw-signature');
    const typeSignatureRadio = document.getElementById('type-signature');
    const drawSignatureSection = document.getElementById('draw-signature-section');
    const typeSignatureSection = document.getElementById('type-signature-section');
    const typedSignatureInput = document.getElementById('typed-signature');
    
    // Config (Replace with your actual EmailJS credentials)
    const config = {
        emailjs: {
            publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
            serviceId: 'YOUR_EMAILJS_SERVICE_ID',
            templateId: 'YOUR_EMAILJS_TEMPLATE_ID'
        }
    };
    
    // Initialize EmailJS
    emailjs.init(config.emailjs.publicKey);
    
    // Initialize Signature Pad with better touch support
    const sigPad = new SignaturePad(signaturePad, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        velocityFilterWeight: 0.7,
        minWidth: 0.5,
        maxWidth: 2.5,
        throttle: 16, // Increase responsiveness
        minDistance: 5 // Reduce jitter
    });
    
    // Initialize IndexedDB storage
    try {
        StorageService.init().catch(error => {
            console.error('Error initializing storage:', error);
        });
    } catch (error) {
        console.error('Error initializing storage:', error);
    }
    
    // Generate a typed signature image
    function generateTypedSignature(name) {
        // Create a temporary canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 600;
        canvas.height = 200;
        
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Configure text style
        ctx.fillStyle = 'black';
        ctx.font = '60px "Brush Script MT", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw text
        ctx.fillText(name, canvas.width / 2, canvas.height / 2);
        
        // Return as data URL
        return canvas.toDataURL('image/png');
    }
    
    // Resize canvas to fit container
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        signaturePad.width = signaturePad.offsetWidth * ratio;
        signaturePad.height = signaturePad.offsetHeight * ratio;
        signaturePad.getContext("2d").scale(ratio, ratio);
        sigPad.clear(); // Clear the canvas
    }
    
    // Handle window resize
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    
    // Toggle between signature methods
    drawSignatureRadio.addEventListener('change', function() {
        if (this.checked) {
            drawSignatureSection.style.display = 'block';
            typeSignatureSection.style.display = 'none';
        }
    });
    
    typeSignatureRadio.addEventListener('change', function() {
        if (this.checked) {
            drawSignatureSection.style.display = 'none';
            typeSignatureSection.style.display = 'block';
        }
    });
    
    // Clear signature button
    clearButton.addEventListener('click', function() {
        sigPad.clear();
    });
    
    // Undo signature button
    undoButton.addEventListener('click', function() {
        const data = sigPad.toData();
        if (data) {
            data.pop(); // Remove the last stroke
            sigPad.fromData(data);
        }
    });
    
    // Add touch event listeners for better mobile experience
    signaturePad.addEventListener('touchstart', function(event) {
        // Prevent scrolling when interacting with the canvas
        event.preventDefault();
    }, { passive: false });
    
    signaturePad.addEventListener('touchmove', function(event) {
        // Prevent scrolling when interacting with the canvas
        event.preventDefault();
    }, { passive: false });
    
    // Contract form submission
    contractForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate signature based on selected method
        const isDrawMethod = drawSignatureRadio.checked;
        
        if (isDrawMethod && sigPad.isEmpty()) {
            alert('Please draw your signature before submitting the form.');
            return;
        }
        
        if (!isDrawMethod && !typedSignatureInput.value.trim()) {
            alert('Please type your name as your signature before submitting the form.');
            return;
        }
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        contractForm.style.display = 'none';
        
        // Get form data
        let signatureDataUrl;
        
        if (isDrawMethod) {
            signatureDataUrl = sigPad.toDataURL();
        } else {
            // Generate a typed signature image
            signatureDataUrl = generateTypedSignature(typedSignatureInput.value.trim());
        }
        
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            role: document.getElementById('role').value,
            notes: document.getElementById('notes').value,
            agreed: document.getElementById('agree').checked,
            signatureDataUrl: signatureDataUrl,
            signatureMethod: isDrawMethod ? 'drawn' : 'typed'
        };
        
        try {
            // Generate PDF
            const pdfBase64 = await PDFGenerator.getPDFBase64(formData);
            
            // Send email via EmailJS
            await EmailService.sendContractEmail(
                formData, 
                pdfBase64, 
                config.emailjs.serviceId, 
                config.emailjs.templateId
            );
            
            // Save to IndexedDB
            try {
                await StorageService.saveContract({
                    ...formData,
                    pdfBase64: pdfBase64
                });
            } catch (storageError) {
                console.error('Storage error (non-critical):', storageError);
                // Continue with the workflow even if storage fails
            }
            
            // Show success message
            loadingIndicator.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Download button functionality
            downloadButton.addEventListener('click', function() {
                PDFGenerator.downloadPDF(formData);
            });
            
        } catch (error) {
            console.error('Error processing contract:', error);
            loadingIndicator.style.display = 'none';
            contractForm.style.display = 'block';
            alert('There was an error processing your contract. Please try again.');
        }
    });
    
    // Prevent form submission when hitting Enter
    contractForm.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });
    
    // Update progress indicator based on form fields
    function updateProgressIndicator() {
        const steps = document.querySelectorAll('.progress-indicator .step');
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const agree = document.getElementById('agree').checked;
        
        // Step 1: Personal Information
        if (fullName && email && phone) {
            steps[0].classList.add('completed');
        } else {
            steps[0].classList.remove('completed');
        }
        
        // Step 2: Contract Agreement
        if (agree) {
            steps[1].classList.add('completed');
        } else {
            steps[1].classList.remove('completed');
        }
        
        // Step 3: Signature
        const isDrawMethod = drawSignatureRadio.checked;
        if ((isDrawMethod && !sigPad.isEmpty()) || 
            (!isDrawMethod && typedSignatureInput.value.trim())) {
            steps[2].classList.add('completed');
        } else {
            steps[2].classList.remove('completed');
        }
    }
    
    // Add event listeners for form fields to update progress
    document.getElementById('fullName').addEventListener('input', updateProgressIndicator);
    document.getElementById('email').addEventListener('input', updateProgressIndicator);
    document.getElementById('phone').addEventListener('input', updateProgressIndicator);
    document.getElementById('agree').addEventListener('change', updateProgressIndicator);
    signaturePad.addEventListener('mouseup', updateProgressIndicator);
    signaturePad.addEventListener('touchend', updateProgressIndicator);
    typedSignatureInput.addEventListener('input', updateProgressIndicator);
    
    // Initialize progress indicator
    updateProgressIndicator();
});
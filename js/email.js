/**
 * Email handling functionality using EmailJS
 */

const EmailService = {
    // Initialize EmailJS with your public key
    init: function(publicKey) {
        emailjs.init(publicKey);
    },
    
    // Send the signed contract via email
    sendContractEmail: async function(formData, pdfBase64, serviceId, templateId) {
        try {
            // Create EmailJS template parameters
            const templateParams = {
                to_email: formData.email,
                from_name: 'Professional Contract Service',
                to_name: formData.fullName,
                client_name: formData.fullName,
                client_email: formData.email,
                client_phone: formData.phone,
                client_role: formData.role || 'N/A',
                notes: formData.notes || 'No additional notes provided',
                pdf_attachment: pdfBase64,
                signature: formData.signatureDataUrl,
                date: new Date().toLocaleDateString()
            };
            
            // Send email using EmailJS
            const response = await emailjs.send(serviceId, templateId, templateParams);
            
            console.log('Email sent successfully:', response);
            return response;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    },
    
    // Send a confirmation email to the client
    sendConfirmationEmail: async function(formData, serviceId, templateId) {
        try {
            // Create EmailJS template parameters for confirmation
            const templateParams = {
                to_email: formData.email,
                from_name: 'Professional Contract Service',
                to_name: formData.fullName,
                client_name: formData.fullName,
                date: new Date().toLocaleDateString()
            };
            
            // Send confirmation email using EmailJS
            const response = await emailjs.send(serviceId, templateId, templateParams);
            
            console.log('Confirmation email sent successfully:', response);
            return response;
        } catch (error) {
            console.error('Error sending confirmation email:', error);
            throw error;
        }
    }
};

// Export the EmailService object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailService;
}
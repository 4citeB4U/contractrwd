/**
 * PDF Generation Service
 * Handles PDF creation and formatting for signed contracts
 */

const PDFGenerator = {
    
    // Generate a professional PDF contract
    generateContract: async function(formData) {
        return new Promise((resolve) => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Set up document properties
            this.setDocumentProperties(doc);
            
            // Add header
            this.addHeader(doc);
            
            // Add client information
            let yPos = this.addClientInfo(doc, formData, 40);
            
            // Add contract content
            yPos = this.addContractContent(doc, yPos);
            
            // Add additional notes if provided
            if (formData.notes) {
                yPos = this.addNotes(doc, formData.notes, yPos);
            }
            
            // Add signature section
            this.addSignature(doc, formData, yPos);
            
            // Add footer
            this.addFooter(doc, formData);
            
            resolve(doc);
        });
    },
    
    // Set document properties
    setDocumentProperties: function(doc) {
        doc.setProperties({
            title: 'Professional Service Agreement',
            subject: 'Contract Agreement',
            author: 'Professional Contract Service',
            creator: 'Contract Signing App'
        });
    },
    
    // Add header to PDF
    addHeader: function(doc) {
        // Header background with gradient effect
        const gradient = [30, 64, 175, 37, 99, 235];
        doc.setFillColor(gradient[0], gradient[1], gradient[2]);
        doc.rect(0, 0, 210, 25, 'F');
        
        // Draw gradient effect manually
        for (let i = 0; i < 15; i++) {
            const ratio = i / 15;
            const r = gradient[0] + (gradient[3] - gradient[0]) * ratio;
            const g = gradient[1] + (gradient[4] - gradient[1]) * ratio;
            const b = gradient[2] + (gradient[5] - gradient[2]) * ratio;
            doc.setFillColor(r, g, b);
            doc.rect(0, i * 1.7, 210, 1.7, 'F');
        }
        
        // Title
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255); // White
        doc.text('WEB DEVELOPMENT AGREEMENT', 105, 15, { align: 'center' });
        
        // Date line
        doc.setFontSize(10);
        const today = new Date().toLocaleDateString();
        doc.text(`Generated on: ${today}`, 105, 20, { align: 'center' });
    },
    
    // Add client information section
    addClientInfo: function(doc, formData, startY) {
        doc.setFontSize(14);
        doc.setTextColor(30, 64, 175); // Primary blue
        doc.text('CLIENT INFORMATION', 20, startY);
        
        // Draw line under heading
        doc.setDrawColor(30, 64, 175);
        doc.line(20, startY + 2, 120, startY + 2);
        
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55); // Dark gray
        
        let y = startY + 10;
        doc.text(`Full Name: ${formData.fullName}`, 20, y);
        y += 6;
        doc.text(`Email Address: ${formData.email}`, 20, y);
        y += 6;
        doc.text(`Phone Number: ${formData.phone}`, 20, y);
        
        if (formData.role) {
            y += 6;
            doc.text(`Company/Entity: ${formData.role}`, 20, y);
        }
        
        return y + 15;
    },
    
    // Add contract content
    addContractContent: function(doc, startY) {
        doc.setFontSize(14);
        doc.setTextColor(30, 64, 175); // Primary blue
        doc.text('TERMS AND CONDITIONS', 20, startY);
        
        // Draw line under heading
        doc.setDrawColor(30, 64, 175);
        doc.line(20, startY + 2, 120, startY + 2);
        
        // Contract title
        doc.setFontSize(14);
        doc.setTextColor(30, 64, 175); // Primary blue
        doc.text(contractTemplate.title, 105, y, { align: 'center' });
        y += 10;
        
        // Contract introduction
        doc.setFontSize(10);
        doc.setTextColor(31, 41, 55); // Dark gray
        
        const intro = contractTemplate.intro.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '');
        const splitIntro = doc.splitTextToSize(intro, 170);
        doc.text(splitIntro, 20, y);
        y += splitIntro.length * 4 + 10;
        
        // Contract sections
        const sections = contractTemplate.sections;
        
        sections.forEach(section => {
            // Check if we need a new page
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            // Section title
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(section.title, 20, y);
            y += 6;
            
            // Section content - clean HTML tags
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const cleanContent = section.content.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '');
            const splitContent = doc.splitTextToSize(cleanContent, 170);
            doc.text(splitContent, 20, y);
            y += splitContent.length * 3.5 + 8;
        });
        
        return y;
    },
    
    // Add additional notes section
    addNotes: function(doc, notes, startY) {
        // Check if we need a new page
        if (startY > 250) {
            doc.addPage();
            startY = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(30, 64, 175); // Primary blue
        doc.text('ADDITIONAL NOTES', 20, startY);
        
        // Draw line under heading
        doc.setDrawColor(30, 64, 175);
        doc.line(20, startY + 2, 120, startY + 2);
        
        doc.setFontSize(10);
        doc.setTextColor(31, 41, 55); // Dark gray
        const splitNotes = doc.splitTextToSize(notes, 170);
        doc.text(splitNotes, 20, startY + 10);
        
        return startY + 10 + (splitNotes.length * 5) + 10;
    },
    
    // Add signature section
    addSignature: function(doc, formData, startY) {
        // Check if we need a new page
        if (startY > 220) {
            doc.addPage();
            startY = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(30, 64, 175); // Primary blue
        doc.text('ELECTRONIC SIGNATURE', 20, startY);
        
        // Draw line under heading
        doc.setDrawColor(30, 64, 175);
        doc.line(20, startY + 2, 120, startY + 2);
        
        // Add signature image
        if (formData.signatureDataUrl) {
            doc.addImage(formData.signatureDataUrl, 'PNG', 20, startY + 10, 80, 30);
        }
        
        // Signature line
        doc.setDrawColor(200, 200, 200);
        doc.line(20, startY + 45, 100, startY + 45);
        
        doc.setFontSize(10);
        doc.setTextColor(31, 41, 55); // Dark gray
        doc.text(`Signature: ${formData.fullName}`, 20, startY + 50);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, startY + 56);
        
        // Agreement statement
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99); // Gray
        const agreementText = `By signing above, ${formData.fullName} electronically agrees to the terms and conditions outlined in this agreement.`;
        const splitAgreement = doc.splitTextToSize(agreementText, 170);
        doc.text(splitAgreement, 20, startY + 65);
    },
    
    // Add footer
    addFooter: function(doc, formData) {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Footer background
            doc.setFillColor(248, 250, 252); // Light gray
            doc.rect(0, 285, 210, 12, 'F');
            
            // Footer text
            doc.setFontSize(8);
            doc.setTextColor(75, 85, 99); // Gray
            doc.text('Rapid Web Development - Web Development Agreement', 105, 291, { align: 'center' });
            doc.text(`Page ${i} of ${pageCount}`, 190, 291, { align: 'right' });
        }
    },
    
    // Generate PDF for download
    downloadPDF: function(formData) {
        this.generateContract(formData).then(doc => {
            const fileName = `${formData.fullName.replace(/\s+/g, '_')}_Contract_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
        });
    },
    
    // Get PDF as base64 string for email attachment
    getPDFBase64: async function(formData) {
        const doc = await this.generateContract(formData);
        return doc.output('datauristring');
    }
};

// Export the PDFGenerator object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFGenerator;
}
/**
 * Contract Template Text
 * This file contains the web development contract text that will be used in the application.
 */

const contractTemplate = {
    title: "WEB DEVELOPMENT & CODE ASSIGNMENT AGREEMENT",
    intro: "This Agreement is entered into as of the date of electronic signature (\"Effective Date\"), by and between:<br><br><strong>Developer:</strong> Leonard J. Lee, d/b/a Rapid Web Development (hereinafter referred to as \"Developer\"), with primary email contact: agentlee@rapidwebdevelop.com and business phone: (414) 626-9992.<br><br><strong>Client:</strong> The client identified in this document (hereinafter referred to as \"Client\").",
    sections: [
        {
            title: "1. SCOPE OF WORK",
            content: "The Developer agrees to create and deliver a custom web application (hereinafter, the \"Project\") according to the Client's specified requirements. This includes:<ul><li>Full front-end website design and development.</li><li>GitHub repository setup and source code configuration.</li><li>Transfer of all associated project files in downloadable format.</li><li>Technical support during initial deployment.</li></ul>"
        },
        {
            title: "2. OWNERSHIP & INTELLECTUAL PROPERTY RIGHTS",
            content: "<ul><li>Upon full completion of the Project and receipt of agreed compensation, the Developer hereby <strong>assigns all rights, title, and interest</strong> in the Project source code and materials to the Client.</li><li>The Client shall hold <strong>exclusive, irrevocable ownership rights</strong> to the code and assets delivered, including the right to modify, distribute, or commercialize the code, provided that such use does not infringe upon third-party rights or violate applicable laws.</li><li>The Developer <strong>waives any claim of future ownership or royalties</strong> associated with the transferred work, except in cases of subsequent written agreement for future modifications.</li></ul>"
        },
        {
            title: "3. DEVELOPER RIGHTS & RETAINED COPIES",
            content: "<ul><li>The Developer may retain a copy of the Project files for <strong>archival and backup purposes only</strong>.</li><li>Such copies shall not be reused, redistributed, repurposed, or re-sold in any form without express written authorization from the Client.</li><li>The Developer is permitted to reference the Project in a portfolio or case study <strong>only with written permission</strong> from the Client.</li></ul>"
        },
        {
            title: "4. LIMITATIONS OF USE & TRADEMARK RESTRICTIONS",
            content: "<ul><li>The Client agrees not to publicly misrepresent or rebrand the Project as being developed by any other entity.</li><li>The Client <strong>may not use the Rapid Web Development name, logo, or proprietary methods</strong> in association with any unlawful, misleading, or unethical use of the code.</li></ul>"
        },
        {
            title: "5. COMPENSATION",
            content: "The Client agrees to compensate the Developer as agreed upon separately, which may include monetary payment or barter exchange of equivalent value."
        },
        {
            title: "6. CLIENT REPRESENTATIONS",
            content: "The Client confirms that:<ul><li>They are the rightful recipient and intended user of the Project.</li><li>They will not reverse engineer or repurpose parts of the platform for competing resale.</li><li>They are solely responsible for the use, modification, and deployment of the source code after delivery.</li></ul>"
        },
        {
            title: "7. DELIVERY & TERMINATION",
            content: "<ul><li>Final files shall be delivered via GitHub repository and optional ZIP download.</li><li>This Agreement is deemed fulfilled upon delivery, with no ongoing obligations unless separately contracted.</li><li>Either party may terminate this Agreement before final delivery by providing written notice. If terminated early, any completed work will be delivered, and partial compensation may be owed based on time and scope.</li></ul>"
        },
        {
            title: "8. DISPUTE RESOLUTION",
            content: "In the event of a dispute, both parties agree to attempt resolution in good faith. If unresolved, jurisdiction shall reside in the courts of Milwaukee County, Wisconsin, where Developer resides and operates."
        },
        {
            title: "9. ENTIRE AGREEMENT",
            content: "This document represents the entire understanding between the parties. Any amendments must be in writing and signed by both."
        },
        {
            title: "10. SIGNATURES",
            content: "By signing this Agreement electronically, both parties acknowledge they have read, understood, and agree to be bound by the terms and conditions set forth in this Agreement."
        }
    ],
    
    // Function to get the full contract text
    getFullText: function() {
        let text = `${this.title}\n\n${this.intro.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '')}\n\n`;
        
        this.sections.forEach(section => {
            text += `${section.title}\n${section.content.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '')}\n\n`;
        });
        
        return text;
    },
    
    // Function to get the contract HTML for display
    getHTML: function() {
        let html = `<h4 class="contract-title">${this.title}</h4>
        <p class="contract-intro">${this.intro}</p>`;
        
        this.sections.forEach(section => {
            html += `<div class="contract-section">
            <h5 class="section-title">${section.title}</h5>
            <div class="section-content">${section.content}</div>
            </div>`;
        });
        
        return html;
    }
};

// Export the contract template
if (typeof module !== 'undefined' && module.exports) {
    module.exports = contractTemplate;
}
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a detailed PDF report from a given HTML element.
 * @param {string} elementId - The ID of the HTML element to capture.
 * @param {Object} metadata - Additional info like Title, Role, Date.
 */
export const generatePDFReport = async (elementId, metadata = {}) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with ID ${elementId} not found.`);
        return;
    }

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#0a0a0f', // Match app background
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        // Add Header Text in PDF if needed (optional since we capture the whole screen)
        // But let's just use the image for full fidelity of graphs
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

        const fileName = `${metadata.role || 'System'}_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);

        return true;
    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
};

/**
 * Generates a structured multi-page PDF with custom data (Advanced version)
 */
export const generateDetailedPDF = (title, data, role) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(99, 102, 241); // Primary color
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 35);
    doc.text(`System: NeuralGuardian AI | Role: ${role}`, pageWidth - 20, 35, { align: 'right' });

    y = 60;

    // Data Summary
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.text('Performance Summary', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // Iterate through data
    Object.entries(data).forEach(([key, value]) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(`${key}:`, 25, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${value}`, 80, y);
        y += 8;
    });

    // Simple table simulation
    y += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Logs', 20, y);
    y += 10;

    // Header for "table"
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y, pageWidth - 40, 10, 'F');
    doc.setFontSize(10);
    doc.text('Metric', 25, y + 7);
    doc.text('Status', 100, y + 7);
    doc.text('Trend', 160, y + 7);
    y += 15;

    const dummyMetrics = [
        { m: 'Neural Load', s: 'Optimal', t: 'Steady' },
        { m: 'Stability Index', s: 'High', t: 'Improving' },
        { m: 'Burnout Risk', s: 'Low', t: 'Decreasing' },
        { m: 'Focus Capacity', s: 'Adaptive', t: 'Peak' }
    ];

    dummyMetrics.forEach(item => {
        doc.text(item.m, 25, y);
        doc.text(item.s, 100, y);
        doc.text(item.t, 160, y);
        y += 8;
    });

    doc.save(`${role}_Detailed_Insight_${Date.now()}.pdf`);
};

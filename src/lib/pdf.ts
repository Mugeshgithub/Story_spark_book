import jsPDF from 'jspdf';
import { Book } from '@/lib/types';

const addImageToPdf = (doc: jsPDF, dataUrl: string, yPos: number, pageW: number, margin: number): Promise<{ newY: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const contentW = pageW - margin * 2;
            const imgRatio = img.width / img.height;
            let imgWidth = contentW * 0.8;
            let imgHeight = imgWidth / imgRatio;

            const pageH = doc.internal.pageSize.getHeight();
            const remainingPageHeight = pageH - yPos - margin;
            if (imgHeight > remainingPageHeight) {
                imgHeight = remainingPageHeight;
                imgWidth = imgHeight * imgRatio;
            }

            const x = (pageW - imgWidth) / 2;
            doc.addImage(img, 'PNG', x, yPos, imgWidth, imgHeight);
            resolve({ newY: yPos + imgHeight + 10 });
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
};

const addTextToPdf = (doc: jsPDF, text: string, yPos: number, pageW: number, margin: number): number => {
    const contentW = pageW - margin * 2;
    const pageH = doc.internal.pageSize.getHeight();
    const lines = doc.splitTextToSize(text, contentW);
    const textHeight = lines.length * 12; // Approximation

    if (yPos + textHeight > pageH - margin) {
        doc.addPage();
        yPos = margin;
    }
    
    doc.text(lines, margin, yPos);
    return yPos + textHeight + 10;
};

export const exportToPdf = async (book: Book) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
    });

    const pageMargin = 40;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const contentW = pageW - pageMargin * 2;
    let y = pageMargin;

    // --- Title Page ---
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    const titleText = doc.splitTextToSize(book.title, contentW);
    doc.text(titleText, pageW / 2, 150, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`A Story by Story Spark`, pageW / 2, 220, { align: 'center' });
    // --- End Title Page ---

    doc.addPage();
    y = pageMargin;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = book.content;

    for (const node of Array.from(tempDiv.childNodes)) {
        if (y > pageH - pageMargin) {
            doc.addPage();
            y = pageMargin;
        }

        if (node.nodeName === 'H1' || node.nodeName === 'H2' || node.nodeName === 'H3') {
            doc.setFont('helvetica', 'bold');
            const fontSize = node.nodeName === 'H1' ? 24 : node.nodeName === 'H2' ? 18 : 14;
            doc.setFontSize(fontSize);
            y = addTextToPdf(doc, node.textContent || '', y, pageW, pageMargin);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
        } else if (node.nodeName === 'P' || node.nodeName === 'BLOCKQUOTE' || node.nodeName === 'UL' || node.nodeName === 'OL') {
            y = addTextToPdf(doc, node.textContent || '', y, pageW, pageMargin);
        } else if (node.nodeName === 'IMG') {
            const imgElement = node as HTMLImageElement;
            try {
                const { newY } = await addImageToPdf(doc, imgElement.src, y, pageW, pageMargin);
                y = newY;
            } catch (e) {
                console.error("Could not add image to PDF, skipping.", e);
            }
        }
    }

    doc.save(`${book.slug}.pdf`);
};

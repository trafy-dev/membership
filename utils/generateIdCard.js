const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// Paths
const LOGO_PATH = path.join(__dirname, '..', 'logo.jpg');

// Color palette — dark black + red accent
const COLORS = {
    background: '#0A0A0A',
    cardBg: '#141414',
    accent: '#E63946',
    accentDark: '#B71C2C',
    white: '#FFFFFF',
    lightGray: '#CCCCCC',
    dimGray: '#888888',
    border: '#2A2A2A'
};

/**
 * Generate a student-style vertical membership ID card PDF.
 * Streams directly to the response object — no temp file.
 *
 * Layout:
 * ┌─────────────────────────────┐
 * │       ORG LOGO (image)      │
 * │   ── red accent line ──     │
 * │      [Member Photo]         │
 * │       MEMBER NAME           │
 * │       Member ID             │
 * │   ── red accent line ──     │
 * │   Address | Contact | Blood │
 * │   ── red accent line ──     │
 * │        Footer               │
 * └─────────────────────────────┘
 */
function generateIdCard(member, outputStream) {
    // Card dimensions (pts) — vertical card, ~3.5in x 5.5in
    const cardWidth = 252;
    const cardHeight = 396;

    const doc = new PDFDocument({
        size: [cardWidth, cardHeight],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        info: {
            Title: `Membership ID Card - ${member.name}`,
            Author: 'Dravida Maanavar Peravai',
            Subject: `Member ID: ${member.member_id}`
        }
    });

    // Pipe to response stream
    doc.pipe(outputStream);

    // ── Background ──
    doc.rect(0, 0, cardWidth, cardHeight).fill(COLORS.background);

    // ── Inner card with subtle border ──
    const margin = 6;
    const innerW = cardWidth - margin * 2;
    const innerH = cardHeight - margin * 2;
    doc.roundedRect(margin, margin, innerW, innerH, 8)
        .lineWidth(1)
        .strokeColor(COLORS.accent)
        .fillAndStroke(COLORS.cardBg, COLORS.accent);

    let currentY = margin + 10;

    // ── Organization Logo ──
    if (fs.existsSync(LOGO_PATH)) {
        const logoWidth = 70;
        const logoHeight = 70;
        const logoX = (cardWidth - logoWidth) / 2;
        doc.image(LOGO_PATH, logoX, currentY, {
            width: logoWidth,
            height: logoHeight,
            fit: [logoWidth, logoHeight],
            align: 'center',
            valign: 'center'
        });
        currentY += logoHeight + 6;
    } else {
        // Fallback text if logo file not found
        doc.fontSize(8)
            .fillColor(COLORS.accent)
            .text('DRAVIDA MAANAVAR PERAVAI', margin + 10, currentY, {
                width: innerW - 20,
                align: 'center'
            });
        currentY += 20;
    }

    // ── Title ──
    doc.fontSize(7)
        .fillColor(COLORS.accent)
        .text('MEMBERSHIP CARD', margin + 10, currentY, {
            width: innerW - 20,
            align: 'center'
        });
    currentY += 14;

    // ── Red accent line ──
    drawAccentLine(doc, margin + 15, currentY, cardWidth - margin - 15);
    currentY += 8;

    // ── Member Photo ──
    const photoSize = 80;
    const photoX = (cardWidth - photoSize) / 2;

    // Photo border (red)
    doc.roundedRect(photoX - 2, currentY - 2, photoSize + 4, photoSize + 4, 4)
        .lineWidth(1.5)
        .strokeColor(COLORS.accent)
        .stroke();

    // Embed member photo
    const profilePicPath = path.join(__dirname, '..', member.profile_picture || '');
    let photoLoaded = false;
    if (member.profile_picture && fs.existsSync(profilePicPath)) {
        try {
            doc.image(profilePicPath, photoX, currentY, {
                width: photoSize,
                height: photoSize,
                fit: [photoSize, photoSize],
                align: 'center',
                valign: 'center'
            });
            photoLoaded = true;
        } catch (imgErr) {
            console.error('[PDF] Could not embed member photo:', imgErr.message);
        }
    }
    if (!photoLoaded) {
        // Placeholder if no photo or load failed
        doc.roundedRect(photoX, currentY, photoSize, photoSize, 3)
            .fill(COLORS.border);
        doc.fontSize(7)
            .fillColor(COLORS.dimGray)
            .text('NO PHOTO', photoX, currentY + 35, {
                width: photoSize,
                align: 'center'
            });
    }
    currentY += photoSize + 10;

    // ── Member Name (bold, large) ──
    doc.fontSize(12)
        .fillColor(COLORS.white)
        .text(member.name.toUpperCase(), margin + 10, currentY, {
            width: innerW - 20,
            align: 'center'
        });
    currentY += 18;

    // ── Member ID ──
    doc.fontSize(8)
        .fillColor(COLORS.accent)
        .text(member.member_id, margin + 10, currentY, {
            width: innerW - 20,
            align: 'center'
        });
    currentY += 14;

    // ── Red accent line ──
    drawAccentLine(doc, margin + 15, currentY, cardWidth - margin - 15);
    currentY += 10;

    // ── Details section ──
    const detailX = margin + 18;
    const detailWidth = innerW - 36;
    const lineHeight = 14;

    // Address
    if (member.address) {
        drawDetailRow(doc, 'ADDRESS', member.address, detailX, currentY, detailWidth);
        currentY += lineHeight;
    }

    // Contact Number
    if (member.contact_number) {
        drawDetailRow(doc, 'CONTACT', member.contact_number, detailX, currentY, detailWidth);
        currentY += lineHeight;
    }

    // Blood Group
    if (member.blood_group) {
        drawDetailRow(doc, 'BLOOD GROUP', member.blood_group, detailX, currentY, detailWidth);
        currentY += lineHeight;
    }

    // ── Footer accent line ──
    const footerLineY = cardHeight - margin - 22;
    drawAccentLine(doc, margin + 15, footerLineY, cardWidth - margin - 15);

    // ── Footer ──
    doc.fontSize(5)
        .fillColor(COLORS.dimGray)
        .text('DRAVIDA MAANAVAR PERAVAI', margin + 10, footerLineY + 5, {
            width: innerW - 20,
            align: 'center'
        });

    doc.fontSize(4)
        .fillColor(COLORS.dimGray)
        .text('This card is property of the organization. If found, please return.', margin + 10, footerLineY + 12, {
            width: innerW - 20,
            align: 'center'
        });

    // Finalize
    doc.end();
}

/**
 * Draw a horizontal red accent line
 */
function drawAccentLine(doc, x1, y, x2) {
    doc.moveTo(x1, y)
        .lineTo(x2, y)
        .lineWidth(1.5)
        .strokeColor(COLORS.accent)
        .stroke();
}

/**
 * Draw a detail row: LABEL: value
 */
function drawDetailRow(doc, label, value, x, y, width) {
    // Label
    doc.fontSize(5.5)
        .fillColor(COLORS.accent)
        .text(label, x, y, { continued: false });

    // Value
    doc.fontSize(7)
        .fillColor(COLORS.white)
        .text(value, x, y + 5.5, {
            width: width,
            ellipsis: true
        });
}

module.exports = { generateIdCard };

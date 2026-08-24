const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// Paths
const LOGO_PATH = path.join(__dirname, '..', 'logo.jpg');

// Design Tokens & Colors
const PALETTE = {
    cardBg: '#0F0F12',
    cardSurface: '#16161C',
    primaryRed: '#B30000',
    brightRed: '#E60000',
    deepRed: '#590000',
    gold: '#D4AF37',
    goldLight: '#F3E5AB',
    white: '#FFFFFF',
    textMuted: '#9E9EA7',
    textFaint: '#62626D',
    border: '#272732',
    pillBg: 'rgba(230, 0, 0, 0.15)'
};

/**
 * Senior UI/UX Professional Membership ID Card Generator
 * Inspired by modern executive and student identity credentials
 */
function generateIdCard(member, outputStream) {
    const cardWidth = 260;
    const cardHeight = 420;
    const margin = 10;
    const cardRadius = 14;

    const doc = new PDFDocument({
        size: [cardWidth, cardHeight],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        info: {
            Title: `Membership Card - ${member.name}`,
            Author: 'Dravida Maanavar Peravai',
            Subject: `Member ID: ${member.member_id}`
        }
    });

    doc.pipe(outputStream);

    // ── 1. Card Base Container ──
    doc.roundedRect(margin, margin, cardWidth - margin * 2, cardHeight - margin * 2, cardRadius)
        .fill(PALETTE.cardBg);

    // Outer subtle border
    doc.roundedRect(margin, margin, cardWidth - margin * 2, cardHeight - margin * 2, cardRadius)
        .lineWidth(1)
        .strokeColor(PALETTE.border)
        .stroke();

    // ── 2. Top Header Wave (Curved Architectural Crest) ──
    const headerH = 105;
    doc.save();
    // Clip to rounded card bounds
    doc.roundedRect(margin, margin, cardWidth - margin * 2, cardHeight - margin * 2, cardRadius).clip();

    // Top background gradient / block
    doc.rect(margin, margin, cardWidth - margin * 2, headerH).fill(PALETTE.deepRed);

    // Primary Crimson Dynamic Arc
    doc.path(`M ${margin} ${margin} L ${cardWidth - margin} ${margin} L ${cardWidth - margin} ${headerH - 20} Q ${cardWidth / 2} ${headerH + 25} ${margin} ${headerH - 20} Z`)
        .fill(PALETTE.primaryRed);

    // Gold Accent Wave Rib
    doc.path(`M ${margin} ${headerH - 18} Q ${cardWidth / 2} ${headerH + 28} ${cardWidth - margin} ${headerH - 18} L ${cardWidth - margin} ${headerH - 14} Q ${cardWidth / 2} ${headerH + 32} ${margin} ${headerH - 14} Z`)
        .fill(PALETTE.gold);

    // Organization Logo Badge (Clean circular pill)
    const logoSize = 48;
    const logoX = (cardWidth - logoSize) / 2;
    const logoY = margin + 10;

    doc.circle(cardWidth / 2, logoY + logoSize / 2, (logoSize / 2) + 3)
        .fill(PALETTE.white);

    if (fs.existsSync(LOGO_PATH)) {
        try {
            doc.save();
            doc.circle(cardWidth / 2, logoY + logoSize / 2, logoSize / 2).clip();
            doc.image(LOGO_PATH, logoX, logoY, {
                width: logoSize,
                height: logoSize,
                fit: [logoSize, logoSize],
                align: 'center',
                valign: 'center'
            });
            doc.restore();
        } catch (e) {
            console.error('[PDF] Logo load exception:', e.message);
        }
    }

    doc.circle(cardWidth / 2, logoY + logoSize / 2, (logoSize / 2) + 3)
        .lineWidth(1.5)
        .strokeColor(PALETTE.gold)
        .stroke();

    // Header Title
    doc.fontSize(7.5)
        .font('Helvetica-Bold')
        .fillColor(PALETTE.white)
        .text('DRAVIDA MAANAVAR PERAVAI', margin, logoY + logoSize + 6, {
            width: cardWidth - margin * 2,
            align: 'center',
            characterSpacing: 0.8
        });

    doc.restore(); // Restore clip

    // ── 3. Member Photo (Centered Floating Badge with Ring) ──
    const photoSize = 74;
    const photoY = headerH - 8;
    const photoCenterX = cardWidth / 2;
    const photoCenterY = photoY + photoSize / 2;

    // Outer Glow & Gold Ring
    doc.circle(photoCenterX, photoCenterY, (photoSize / 2) + 4)
        .lineWidth(2.5)
        .strokeColor(PALETTE.gold)
        .fill(PALETTE.cardSurface);

    // Inner White Ring
    doc.circle(photoCenterX, photoCenterY, (photoSize / 2) + 1.5)
        .lineWidth(1.5)
        .strokeColor(PALETTE.white)
        .stroke();

    // Embed Member Photo
    const profilePicPath = path.join(__dirname, '..', member.profile_picture || '');
    let photoLoaded = false;

    if (member.profile_picture && fs.existsSync(profilePicPath)) {
        try {
            doc.save();
            doc.circle(photoCenterX, photoCenterY, photoSize / 2).clip();
            doc.image(profilePicPath, photoCenterX - photoSize / 2, photoY, {
                width: photoSize,
                height: photoSize,
                fit: [photoSize, photoSize],
                align: 'center',
                valign: 'center'
            });
            doc.restore();
            photoLoaded = true;
        } catch (err) {
            console.error('[PDF] Member photo embed error:', err.message);
        }
    }

    if (!photoLoaded) {
        doc.circle(photoCenterX, photoCenterY, photoSize / 2).fill(PALETTE.border);
        doc.fontSize(7)
            .font('Helvetica-Bold')
            .fillColor(PALETTE.textMuted)
            .text('NO PHOTO', photoCenterX - photoSize / 2, photoCenterY - 4, {
                width: photoSize,
                align: 'center'
            });
    }

    // ── 4. Member Name & Role Pill ──
    let cursorY = photoY + photoSize + 10;

    doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(PALETTE.white)
        .text((member.name || 'MEMBER NAME').toUpperCase(), margin, cursorY, {
            width: cardWidth - margin * 2,
            align: 'center',
            characterSpacing: 0.5
        });

    cursorY += 15;

    // Role Tag Pill (e.g. "STUDENT MEMBER" or "ACTIVE MEMBER")
    const roleText = member.is_student ? 'STUDENT MEMBER' : (member.profession || 'OFFICIAL MEMBER').toUpperCase();
    const pillW = Math.min(130, doc.widthOfString(roleText) + 20);
    const pillH = 14;
    const pillX = (cardWidth - pillW) / 2;

    doc.roundedRect(pillX, cursorY, pillW, pillH, 7)
        .fill(PALETTE.primaryRed);

    doc.fontSize(6.5)
        .font('Helvetica-Bold')
        .fillColor(PALETTE.white)
        .text(roleText, pillX, cursorY + 3.5, {
            width: pillW,
            align: 'center',
            characterSpacing: 0.4
        });

    cursorY += pillH + 12;

    // ── 5. Member Information Data Grid (Clean Two-Column Alignment) ──
    const gridX = margin + 16;
    const gridW = cardWidth - (margin + 16) * 2;
    const labelW = 68;
    const valueW = gridW - labelW - 10;
    const rowGap = 13;

    // Background Cardlet for Data
    const dataBoxH = 88;
    doc.roundedRect(gridX - 8, cursorY - 4, gridW + 16, dataBoxH, 6)
        .lineWidth(1)
        .strokeColor(PALETTE.border)
        .fillAndStroke(PALETTE.cardSurface, PALETTE.border);

    const drawGridRow = (label, value, isHighlight = false) => {
        if (!value) return;

        // Label
        doc.fontSize(6.5)
            .font('Helvetica-Bold')
            .fillColor(PALETTE.textFaint)
            .text(label.toUpperCase(), gridX, cursorY, { width: labelW });

        // Separator Colon
        doc.fontSize(6.5)
            .font('Helvetica-Bold')
            .fillColor(PALETTE.textFaint)
            .text(':', gridX + labelW - 6, cursorY);

        // Value
        doc.fontSize(7.5)
            .font(isHighlight ? 'Helvetica-Bold' : 'Helvetica')
            .fillColor(isHighlight ? PALETTE.brightRed : PALETTE.white)
            .text(value, gridX + labelW + 4, cursorY - 0.5, {
                width: valueW,
                ellipsis: true
            });

        cursorY += rowGap;
    };

    drawGridRow('Member ID', member.member_id, true);
    drawGridRow('Blood Group', member.blood_group || 'N/A', false);
    drawGridRow('Contact', member.contact_number || 'N/A', false);
    
    if (member.is_student && member.institution_name) {
        drawGridRow('Institution', member.institution_name, false);
    } else if (member.city || member.district) {
        drawGridRow('Location', [member.city, member.district, member.state].filter(Boolean).slice(0, 2).join(', '), false);
    } else if (member.address) {
        drawGridRow('Address', member.address, false);
    }

    // ── 6. Barcode & Security Strip Area ──
    const footerY = cardHeight - margin - 42;

    // Simulated Vector Barcode
    drawVectorBarcode(doc, cardWidth / 2 - 60, footerY + 2, 120, 16, member.member_id);

    // Micro Footnote
    doc.fontSize(5)
        .font('Helvetica')
        .fillColor(PALETTE.textFaint)
        .text('OFFICIAL DIGITAL IDENTITY CREDENTIAL • SECURE VERIFIED', margin, footerY + 22, {
            width: cardWidth - margin * 2,
            align: 'center',
            characterSpacing: 0.5
        });

    doc.end();
}

/**
 * Draw a crisp modern simulated vector barcode
 */
function drawVectorBarcode(doc, x, y, width, height, seedText = '') {
    const seed = seedText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 42);
    let currentX = x;
    const barCount = 38;
    const barWidthUnit = width / (barCount * 1.6);

    doc.save();
    for (let i = 0; i < barCount; i++) {
        const isThick = ((seed * (i + 7)) % 5) === 0;
        const w = isThick ? barWidthUnit * 1.8 : barWidthUnit * 0.9;
        const skip = ((seed * (i + 3)) % 7) === 0;

        if (!skip) {
            doc.rect(currentX, y, w, height)
                .fill(PALETTE.white);
        }
        currentX += w + barWidthUnit * 0.7;
        if (currentX >= x + width) break;
    }
    doc.restore();
}

module.exports = { generateIdCard };

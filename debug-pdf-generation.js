const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function debugPDFGeneration() {
    try {
        console.log('=== DEBUGGING PDF GENERATION FOR AUDIT ID 15 ===');
        
        const auditId = 15;
        
        // 1. Check if audit exists and get complete data
        console.log('🔍 Step 1: Checking audit data...');
        const audit = await prisma.audit.findUnique({
            where: { id: auditId },
            include: {
                assignedManager: {
                    select: { name: true, email: true }
                },
                auditPrograms: {
                    include: {
                        evidence: true,
                        findings: true
                    }
                },
                findings: true,
                assignedAuditors: {
                    select: { name: true, email: true }
                },
                reports: {
                    orderBy: { generatedAt: 'desc' },
                    take: 1
                }
            }
        });
        
        if (!audit) {
            console.log('❌ Audit not found');
            return;
        }
        
        console.log('✅ Audit found:', audit.auditName);
        console.log('   Status:', audit.status);
        console.log('   Assigned Manager:', audit.assignedManager?.name || 'Unassigned');
        console.log('   Audit Programs:', audit.auditPrograms.length);
        console.log('   Findings:', audit.findings.length);
        console.log('   Assigned Auditors:', audit.assignedAuditors.length);
        console.log('   Reports:', audit.reports.length);
        
        // 2. Check if there's actual content to generate PDF from
        console.log('\n🔍 Step 2: Checking PDF content...');
        
        if (audit.auditPrograms.length === 0) {
            console.log('⚠️  No audit programs - this might cause blank PDF');
        }
        
        if (audit.findings.length === 0) {
            console.log('⚠️  No findings - this might cause blank PDF');
        }
        
        // 3. Try to import and test the PDF generation
        console.log('\n🔍 Step 3: Testing PDF generation...');
        
        try {
            const { ReportsService } = require('./dist/src/reports/reports.service');
            const reportsService = new ReportsService(prisma);
            
            console.log('📧 Generating PDF buffer...');
            const pdfBuffer = await reportsService.generatePDFBuffer(auditId);
            
            console.log('✅ PDF generated successfully');
            console.log('   Buffer size:', pdfBuffer.length, 'bytes');
            
            if (pdfBuffer.length < 1000) {
                console.log('⚠️  PDF buffer is very small - might be blank');
            }
            
            // Save the PDF to inspect it
            const outputPath = path.join(__dirname, 'debug-audit-15.pdf');
            fs.writeFileSync(outputPath, pdfBuffer);
            console.log('📄 PDF saved to:', outputPath);
            console.log('   Please open this file to check if it has content');
            
        } catch (pdfError) {
            console.error('❌ PDF generation failed:', pdfError.message);
            console.error('   Stack:', pdfError.stack);
            
            if (pdfError.message.includes('Cannot find module')) {
                console.log('   🔍 Missing dependency - PDF library not installed');
            } else if (pdfError.message.includes('PDFKit')) {
                console.log('   🔍 PDFKit related error');
            }
        }
        
        // 4. Check existing PDF file
        console.log('\n🔍 Step 4: Checking existing PDF file...');
        const existingPdfPath = path.join(__dirname, 'uploads', 'reports', 'Audit_Report_15.pdf');
        
        if (fs.existsSync(existingPdfPath)) {
            const stats = fs.statSync(existingPdfPath);
            console.log('✅ Existing PDF found:', existingPdfPath);
            console.log('   File size:', stats.size, 'bytes');
            
            if (stats.size < 1000) {
                console.log('⚠️  Existing PDF is very small - likely blank');
            }
            
            // Read first few bytes to check if it's a valid PDF
            const buffer = fs.readFileSync(existingPdfPath);
            const header = buffer.toString('binary', 0, 10);
            console.log('   File header:', header);
            
            if (!header.startsWith('%PDF')) {
                console.log('❌ File does not appear to be a valid PDF');
            }
        } else {
            console.log('❌ No existing PDF file found');
        }
        
    } catch (error) {
        console.error('❌ Debug script failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugPDFGeneration();

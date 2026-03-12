import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function createRiskAssessmentTable() {
  console.log('🔧 Creating RiskAssessment table...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-risk-assessment-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL content by semicolons to handle multiple statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each SQL statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log(`✅ Statement ${i + 1}: Success`);
      } catch (error) {
        console.log(`⚠️  Statement ${i + 1}: ${error.message}`);
        // Continue with other statements even if one fails
      }
    }
    
    // Verify table was created
    try {
      const result = await prisma.$queryRawUnsafe<Array<any>>('SHOW TABLES LIKE "RiskAssessment"');
      if (result && result.length > 0) {
        console.log('✅ RiskAssessment table created successfully!');
        
        // Test inserting a record
        try {
          // First check if there are any audits
          const auditCount = await prisma.audit.count();
          if (auditCount > 0) {
            await prisma.$queryRawUnsafe(`
              INSERT INTO RiskAssessment (auditId, stage, riskLevel, riskFactors, notes, createdAt, updatedAt)
              VALUES ((SELECT id FROM Audit LIMIT 1), 'test', 'low', '[]', NOW(), NOW())
            `);
            console.log('✅ Test insert successful');
            
            // Clean up test record
            await prisma.$queryRawUnsafe('DELETE FROM RiskAssessment WHERE stage = "test"');
            console.log('✅ Test record cleaned up');
          } else {
            console.log('ℹ️  No audits found for test insert');
          }
        } catch (testError) {
          console.log('⚠️  Test insert failed:', testError.message);
        }
      } else {
        console.log('❌ RiskAssessment table was not created');
      }
    } catch (verifyError) {
      console.log('⚠️  Could not verify table creation:', verifyError.message);
    }
    
  } catch (error) {
    console.error('❌ Error creating RiskAssessment table:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createRiskAssessmentTable()
    .then(() => {
      console.log('🎉 RiskAssessment table creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Table creation failed:', error);
      process.exit(1);
    });
}

export default createRiskAssessmentTable;

import cron from 'node-cron';
import { prisma } from '../config/db.config.js';
import { sendLaunchEmail } from '../utils/email.js';
import { serverConfig } from '../config/app.config.js';

/**
 * Send launch emails to all waitlist subscribers
 */
async function sendLaunchEmails() {
  console.log('🚀 Starting to send launch emails to waitlist subscribers...');
  
  try {
    // Get all emails from the waitlist
    const subscribers = await prisma.waitlistEmail.findMany({
      select: { email: true },
      orderBy: { created_at: 'asc' },
    });

    if (subscribers.length === 0) {
      console.log('ℹ️ No subscribers found in the waitlist.');
      return;
    }

    console.log(`📧 Found ${subscribers.length} subscribers to notify.`);

    // Process emails in batches to avoid overwhelming the SMTP server
    const BATCH_SIZE = 10;
    let successCount = 0;
    let failCount = 0;
    const failedEmails: string[] = [];

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      
      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map(({ email }) => 
          sendLaunchEmail(email)
            .then(() => ({ email, status: 'fulfilled' }))
            .catch(error => {
              console.error(`❌ Failed to send email to ${email}:`, error.message);
              return { email, status: 'rejected', reason: error.message };
            })
        )
      );

      // Process results
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          failCount++;
          failedEmails.push(result.reason.email);
        }
      });

      // Log progress
      const processed = Math.min(i + BATCH_SIZE, subscribers.length);
      console.log(`📊 Progress: ${processed}/${subscribers.length} (${Math.round((processed / subscribers.length) * 100)}%)`);
      
      // Add a small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Log final results
    console.log('✅ Launch email sending completed!');
    console.log(`📨 Sent: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    
    if (failedEmails.length > 0) {
      console.log('\nFailed emails:');
      console.log(failedEmails.join('\n'));
    }

  } catch (error) {
    console.error('❌ Error in sendLaunchEmails job:', error);
  }
}

// Schedule the job to run on July 28th at 9:00 AM
// Format: second minute hour day-of-month month day-of-week
export function scheduleLaunchEmailJob() {
  // For testing, you can use "* * * * *" to run every minute
  const schedule = serverConfig.isProduction 
    ? '0 9 28 7 *'  // 9:00 AM on July 28th
    : '0 * * * *';   // Every hour in development for testing

  console.log(`⏰ Scheduled launch email job: ${schedule}`);
  
  const job = cron.schedule(schedule, async () => {
    console.log('⏰ Running scheduled launch email job...');
    await sendLaunchEmails();
  }, {
    scheduled: true,
    timezone: 'America/Sao_Paulo', // Adjust timezone as needed
  });

  // For testing, you can manually trigger the job
  if (serverConfig.isDevelopment) {
    console.log('🛠️  Development mode: You can manually trigger the job with sendLaunchEmails()');
  }

  return job;
}

// Export for manual triggering if needed
export { sendLaunchEmails };

// Run this file directly for testing: `tsx src/jobs/sendLaunchEmails.ts`
if (import.meta.url.endsWith(process.argv[1])) {
  (async () => {
    console.log('🚀 Running sendLaunchEmails job manually...');
    await sendLaunchEmails();
    process.exit(0);
  })().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

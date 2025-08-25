// Simple Vercel Serverless Function for email notifications
// Uses Edge Config for ultra-low latency or falls back to logging
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Simple endpoint to show stored emails count
    return res.status(200).json({ 
      message: 'Email collection endpoint active',
      info: 'Check Vercel function logs for stored emails'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const timestamp = new Date().toISOString();
    const emailData = {
      email,
      timestamp,
      source: 'liveenity-notifications',
      id: Date.now(),
      userAgent: req.headers['user-agent'] || 'unknown'
    };

    // Log to Vercel function logs (viewable in dashboard)
    console.log('EMAIL_NOTIFICATION:', JSON.stringify(emailData));
    
    // Also log in a structured way for easy parsing
    console.log(`NEW_EMAIL: ${email} at ${timestamp}`);

    res.status(200).json({ 
      success: true, 
      message: 'Email notification registered successfully',
      email: email,
      timestamp: timestamp
    });

  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

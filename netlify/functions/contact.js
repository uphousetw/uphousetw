// Netlify serverless function for handling contact form submissions
export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { name, phone, email, project, message } = JSON.parse(event.body);

    // Validate required fields
    if (!name || !phone || !project || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['name', 'phone', 'project', 'message']
        })
      };
    }

    // Create contact message object
    const contactMessage = {
      name,
      phone,
      email: email || null,
      project,
      message,
      createdAt: new Date().toISOString(),
      id: Date.now().toString()
    };

    // In a real implementation, you would:
    // 1. Save to database or JSON file in Git
    // 2. Send email notification
    // 3. Log to analytics (without PII)

    console.log('Contact form submission:', {
      project: contactMessage.project,
      timestamp: contactMessage.createdAt,
      id: contactMessage.id
    });

    // TODO: Implement email sending
    // await sendEmailNotification(contactMessage);

    // TODO: Save to data storage
    // await saveContactMessage(contactMessage);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '訊息已送出，我們會盡快與您聯絡',
        id: contactMessage.id
      })
    };

  } catch (error) {
    console.error('Contact form error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: '系統錯誤，請稍後再試'
      })
    };
  }
};
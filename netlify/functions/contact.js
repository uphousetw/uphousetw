// Netlify serverless function for handling contact form submissions
import { addContact } from '../data/contacts.js';

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
    const contactData = {
      name,
      phone,
      email: email || null,
      project,
      message
    };

    // Save to data storage using our data layer
    const savedContact = await addContact(contactData);

    console.log('Contact form submission saved:', {
      id: savedContact.id,
      project: savedContact.project,
      timestamp: savedContact.createdAt
    });

    // TODO: Implement email sending
    // await sendEmailNotification(savedContact);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '訊息已送出，我們會盡快與您聯絡',
        id: savedContact.id
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
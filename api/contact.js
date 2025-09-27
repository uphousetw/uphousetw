// Vercel serverless function for handling contact form submissions
import { addContact } from './data/contacts.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, project, message } = req.body;

    // Validate required fields
    if (!name || !phone || !project || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'phone', 'project', 'message']
      });
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

    return res.status(200).json({
      success: true,
      message: '訊息已送出，我們會盡快與您聯絡',
      id: savedContact.id
    });

  } catch (error) {
    console.error('Contact form error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: '系統錯誤，請稍後再試'
    });
  }
}
// Contacts management API for admin functions - Vercel
import jwt from 'jsonwebtoken';
import {
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact
} from './data/contacts.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@example.com'];

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded;

    // Handle demo token for testing
    if (token === 'demo-token') {
      decoded = { email: 'demo@uphousetw.com', role: 'admin' };
    } else {
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(decoded.email)) {
      return res.status(403).json({ error: 'Access denied - admin required' });
    }

    // Get contact ID from query params
    const contactId = req.query.id;

    switch (req.method) {
      case 'GET':
        if (contactId && contactId !== 'contacts') {
          // Get single contact
          const contact = await getContactById(contactId);
          if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
          }
          return res.status(200).json({ contact });
        } else {
          // Get all contacts
          const contacts = await getAllContacts();
          return res.status(200).json({
            contacts: contacts,
            total: contacts.length
          });
        }

      case 'PUT':
        // Update existing contact
        if (!contactId || contactId === 'contacts') {
          return res.status(400).json({ error: 'Contact ID required for update' });
        }

        const updateData = req.body;
        const updatedContact = await updateContact(contactId, updateData);

        if (!updatedContact) {
          return res.status(404).json({ error: 'Contact not found' });
        }

        return res.status(200).json({
          message: 'Contact updated successfully',
          contact: updatedContact
        });

      case 'DELETE':
        // Delete contact
        if (!contactId || contactId === 'contacts') {
          return res.status(400).json({ error: 'Contact ID required for deletion' });
        }

        const deletedContact = await deleteContact(contactId);

        if (!deletedContact) {
          return res.status(404).json({ error: 'Contact not found' });
        }

        return res.status(200).json({
          message: 'Contact deleted successfully',
          contact: deletedContact
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Contacts API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
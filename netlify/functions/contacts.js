// Contacts management API for admin functions
import jwt from 'jsonwebtoken';
import {
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact
} from '../data/contacts.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@example.com'];

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Verify admin authentication
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authorization header missing' })
      };
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
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid or expired token' })
        };
      }
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(decoded.email)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Access denied - admin required' })
      };
    }

    const { httpMethod, path: requestPath } = event;
    const contactId = requestPath.split('/').pop();

    switch (httpMethod) {
      case 'GET':
        if (contactId && contactId !== 'contacts') {
          // Get single contact
          const contact = await getContactById(contactId);
          if (!contact) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Contact not found' })
            };
          }
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ contact })
          };
        } else {
          // Get all contacts
          const contacts = await getAllContacts();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              contacts: contacts,
              total: contacts.length
            })
          };
        }

      case 'PUT':
        // Update existing contact (e.g., mark as read)
        if (!contactId || contactId === 'contacts') {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Contact ID required for update' })
          };
        }

        const updateData = JSON.parse(event.body);
        const updatedContact = await updateContact(contactId, updateData);

        if (!updatedContact) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Contact not found' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'Contact updated successfully',
            contact: updatedContact
          })
        };

      case 'DELETE':
        // Delete contact
        if (!contactId || contactId === 'contacts') {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Contact ID required for deletion' })
          };
        }

        const deletedContact = await deleteContact(contactId);

        if (!deletedContact) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Contact not found' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'Contact deleted successfully',
            contact: deletedContact
          })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

  } catch (error) {
    console.error('Contacts API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
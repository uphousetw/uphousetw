// Contacts data layer with MongoDB
import { getCollection, isMongoDBConfigured } from '../utils/mongodb.js';
import { getAllContacts as getContactsFromFile, getContactById as getContactByIdFromFile, updateContact as updateContactInFile, deleteContact as deleteContactFromFile } from './contacts.js';

/**
 * Get all contacts
 */
export async function getAllContacts() {
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    return getContactsFromFile();
  }

  try {
    const collection = await getCollection('contacts');
    const contacts = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return contacts.map(contact => ({
      ...contact,
      id: contact._id.toString(),
      _id: undefined
    }));
  } catch (error) {
    console.error('MongoDB error, falling back to file system:', error);
    return getContactsFromFile();
  }
}

/**
 * Get single contact by ID
 */
export async function getContactById(contactId) {
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    return getContactByIdFromFile(contactId);
  }

  try {
    const collection = await getCollection('contacts');
    const { ObjectId } = await import('mongodb');

    const contact = await collection.findOne({ _id: new ObjectId(contactId) });

    if (!contact) return null;

    return {
      ...contact,
      id: contact._id.toString(),
      _id: undefined
    };
  } catch (error) {
    console.error('MongoDB error, falling back to file system:', error);
    return getContactByIdFromFile(contactId);
  }
}

/**
 * Add new contact submission
 */
export async function addContact(contactData) {
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    // Import the file-based function if needed
    const { getAllContacts: getAll } = await import('./contacts.js');
    const contacts = await getAll();
    const newContact = {
      id: Date.now().toString(),
      ...contactData,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // Note: file-based saving would happen here
    return newContact;
  }

  try {
    const collection = await getCollection('contacts');

    const newContact = {
      ...contactData,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await collection.insertOne(newContact);

    return {
      ...newContact,
      id: result.insertedId.toString(),
      _id: undefined
    };
  } catch (error) {
    console.error('MongoDB error saving contact:', error);
    throw error;
  }
}

/**
 * Update contact (e.g., status change)
 */
export async function updateContact(contactId, updates) {
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    return updateContactInFile(contactId, updates);
  }

  try {
    const collection = await getCollection('contacts');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(contactId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      ...result,
      id: result._id.toString(),
      _id: undefined
    };
  } catch (error) {
    console.error('MongoDB error, falling back to file system:', error);
    return updateContactInFile(contactId, updates);
  }
}

/**
 * Delete contact
 */
export async function deleteContact(contactId) {
  if (!isMongoDBConfigured()) {
    console.log('⚠️  MongoDB not configured, using file system');
    return deleteContactFromFile(contactId);
  }

  try {
    const collection = await getCollection('contacts');
    const { ObjectId } = await import('mongodb');

    const result = await collection.findOneAndDelete({ _id: new ObjectId(contactId) });

    if (!result) return null;

    return {
      ...result,
      id: result._id.toString(),
      _id: undefined
    };
  } catch (error) {
    console.error('MongoDB error, falling back to file system:', error);
    return deleteContactFromFile(contactId);
  }
}
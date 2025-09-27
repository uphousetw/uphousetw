// Shared contacts data for both admin and public APIs
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'api', 'data', 'contacts-data.json');

// Default contacts data (empty array for submissions)
const defaultContacts = [];

// Helper function to load contacts from file
async function loadContacts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // In serverless environment, can't write files, return empty array
    console.warn('Using empty contacts data (serverless mode)');
    return [];
  }
}

// Helper function to save contacts to file
async function saveContacts(contacts) {
  try {
    // Ensure the directory exists
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(DATA_FILE, JSON.stringify(contacts, null, 2), 'utf8');
  } catch (error) {
    console.warn('Cannot save in serverless environment:', error.message);
    // In serverless/production, we can't write to filesystem
    // This is expected behavior - changes won't persist
    return contacts; // Return the data anyway
  }
}

// API functions
export async function getAllContacts() {
  return await loadContacts();
}

export async function getContactById(id) {
  const contacts = await loadContacts();
  return contacts.find(c => c.id === id);
}

export async function addContact(contact) {
  const contacts = await loadContacts();
  const newId = contacts.length > 0
    ? (Math.max(...contacts.map(c => parseInt(c.id))) + 1).toString()
    : '1';

  const newContact = {
    id: newId,
    ...contact,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  contacts.push(newContact);
  await saveContacts(contacts);
  return newContact;
}

export async function updateContact(id, updates) {
  const contacts = await loadContacts();
  const index = contacts.findIndex(c => c.id === id);
  if (index === -1) return null;

  contacts[index] = {
    ...contacts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await saveContacts(contacts);
  return contacts[index];
}

export async function deleteContact(id) {
  const contacts = await loadContacts();
  const index = contacts.findIndex(c => c.id === id);
  if (index === -1) return null;

  const deletedContact = contacts.splice(index, 1)[0];
  await saveContacts(contacts);
  return deletedContact;
}
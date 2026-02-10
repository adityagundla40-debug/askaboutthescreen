import { Client, Account, Databases, ID } from 'appwrite';

// Appwrite configuration
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '698b46d0003a8811ff32';
const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '698b49fa003378bef51b';
const APPWRITE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID || 'user_history_id';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);

// Export configuration
export const appwriteConfig = {
  endpoint: APPWRITE_ENDPOINT,
  projectId: APPWRITE_PROJECT_ID,
  databaseId: APPWRITE_DATABASE_ID,
  collectionId: APPWRITE_COLLECTION_ID
};

// Export ID for unique IDs
export { ID };

// Authentication functions
export const authService = {
  // Create new account
  async createAccount(email, password, name) {
    try {
      const user = await account.create(ID.unique(), email, password, name);
      console.log('[Appwrite] Account created:', user);
      return { success: true, user };
    } catch (error) {
      console.error('[Appwrite] Create account error:', error);
      return { success: false, error: error.message };
    }
  },

  // Login with email and password
  async login(email, password) {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      console.log('[Appwrite] Login successful:', session);
      return { success: true, session };
    } catch (error) {
      console.error('[Appwrite] Login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const user = await account.get();
      console.log('[Appwrite] Current user:', user);
      return { success: true, user };
    } catch (error) {
      console.error('[Appwrite] Get user error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout
  async logout() {
    try {
      await account.deleteSession('current');
      console.log('[Appwrite] Logout successful');
      return { success: true };
    } catch (error) {
      console.error('[Appwrite] Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user is logged in
  async isLoggedIn() {
    try {
      await account.get();
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Database functions
export const databaseService = {
  // Log user activity
  async logActivity(userId, action, data) {
    try {
      const document = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        ID.unique(),
        {
          userId: userId,
          action: action,
          data: JSON.stringify(data),
          timestamp: new Date().toISOString()
        }
      );
      console.log('[Appwrite] Activity logged:', document);
      return { success: true, document };
    } catch (error) {
      console.error('[Appwrite] Log activity error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user history (last 20 activities)
  async getUserHistory(userId, limit = 20) {
    try {
      const { Query } = await import('appwrite');
      const documents = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        [
          Query.equal('userId', userId),
          Query.orderDesc('timestamp'),
          Query.limit(limit)
        ]
      );
      console.log('[Appwrite] History fetched:', documents);
      return { success: true, documents: documents.documents };
    } catch (error) {
      console.error('[Appwrite] Get history error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete activity
  async deleteActivity(documentId) {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        documentId
      );
      console.log('[Appwrite] Activity deleted:', documentId);
      return { success: true };
    } catch (error) {
      console.error('[Appwrite] Delete activity error:', error);
      return { success: false, error: error.message };
    }
  },

  // Clear all user history
  async clearUserHistory(userId) {
    try {
      const { Query } = await import('appwrite');
      const documents = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        [Query.equal('userId', userId)]
      );
      
      // Delete all documents
      for (const doc of documents.documents) {
        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collectionId,
          doc.$id
        );
      }
      
      console.log('[Appwrite] History cleared for user:', userId);
      return { success: true };
    } catch (error) {
      console.error('[Appwrite] Clear history error:', error);
      return { success: false, error: error.message };
    }
  }
};

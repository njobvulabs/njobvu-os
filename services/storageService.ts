
import { supabase } from './supabaseClient';

/**
 * Supabase Storage Service
 * Handles file operations with Supabase Storage Buckets.
 */

export const STORAGE_BUCKET = 'njobvu-drive';

export interface StorageError {
  message: string;
  error?: any;
}

export const storageService = {
  /**
   * Upload a file to a specific path in the bucket
   */
  async uploadFile(path: string, file: File): Promise<{ path: string } | StorageError> {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      return { path: data.path };
    } catch (error: any) {
      console.error('Storage Upload Error:', error);
      return { message: error.message || 'Upload failed', error };
    }
  },

  /**
   * Download a file as a Blob
   */
  async downloadFile(path: string): Promise<Blob | StorageError> {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(path);

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Storage Download Error:', error);
      return { message: error.message || 'Download failed', error };
    }
  },

  /**
   * Get a public URL for a file (if bucket is public)
   */
  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  /**
   * Create a signed URL for private files (valid for 60 seconds by default)
   */
  async getSignedUrl(path: string, expiresIn = 60): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Signed URL Error:', error);
      return null;
    }
  },

  /**
   * List files in a folder
   */
  async listFiles(folder: string = '') {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('List Files Error:', error);
      return [];
    }
  },

  /**
   * Delete files by path
   */
  async deleteFiles(paths: string[]) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(paths);

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Delete Files Error:', error);
      return null;
    }
  }
};

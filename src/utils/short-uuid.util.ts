import { v4 as uuidv4 } from 'uuid';

/**
 * ShortUUID utility class
 * Provides methods to generate and work with shortened UUIDs (22 characters instead of 36)
 */
export class ShortUUID {
  /**
   * Generates a new short UUID
   * @returns A shortened UUID string (22 characters)
   */
  static generate(): string {
    // Generate standard UUID
    const uuid = uuidv4();
    // Remove hyphens and convert to Base64 URL safe
    return ShortUUID.fromUUID(uuid);
  }

  /**
   * Converts a standard UUID to short format
   * @param uuid Standard UUID string
   * @returns Shortened UUID string
   */
  static fromUUID(uuid: string): string {
    // Remove hyphens
    const hexString = uuid.replace(/-/g, '');
    
    // Convert hex to binary
    const buffer = Buffer.from(hexString, 'hex');
    
    // Convert to Base64 URL safe (replace '+' with '-', '/' with '_', remove '=')
    return buffer.toString('base64url');
  }

  /**
   * Converts a short UUID back to standard UUID format
   * @param shortUUID Shortened UUID string
   * @returns Standard UUID string with hyphens
   */
  static toUUID(shortUUID: string): string {
    // Convert back from Base64 URL safe to binary
    const buffer = Buffer.from(shortUUID, 'base64url');
    
    // Convert binary to hex
    const hexString = buffer.toString('hex');
    
    // Add hyphens back in standard UUID positions
    return [
      hexString.substring(0, 8),
      hexString.substring(8, 12),
      hexString.substring(12, 16),
      hexString.substring(16, 20),
      hexString.substring(20)
    ].join('-');
  }
}

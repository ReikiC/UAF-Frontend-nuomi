// Type definitions for the chat application
// Note: Using JSDoc for type safety while maintaining JSX files
// Consider migrating to TypeScript for full type safety

/**
 * @typedef {'user' | 'assistant'} MessageRole
 */

/**
 * @typedef {Object} Message
 * @property {MessageRole} role
 * @property {string} content
 */

/**
 * @typedef {'smart' | 'basic'} ApiType
 */

/**
 * @typedef {Object} ApiResponse
 * @property {string} [message]
 * @property {string} [content]
 */

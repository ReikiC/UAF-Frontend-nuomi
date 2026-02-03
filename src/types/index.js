// Type definitions for the chat application
// Note: Using JSDoc for type safety while maintaining JSX files
// Consider migrating to TypeScript for full type safety

/**
 * @typedef {'user' | 'assistant'} MessageRole
 */

/**
 * @typedef {Object} ToolCallStep
 * @property {string} type - Always "tool_call"
 * @property {string} tool_name - Name of the tool called
 * @property {Object.<string, any>} arguments - Tool input arguments
 * @property {string} result - Tool execution result
 * @property {'success' | 'error'} status - Execution status
 */

/**
 * @typedef {Object} Message
 * @property {MessageRole} role
 * @property {string} content
 * @property {ToolCallStep[]} [steps] - Tool call steps (assistant messages only)
 */

/**
 * @typedef {'smart' | 'basic'} ApiType
 */

/**
 * @typedef {Object} ApiResponse
 * @property {string} [message] - Legacy response format
 * @property {string} [content] - Legacy response format
 * @property {string} [final_message] - New structured response format
 * @property {ToolCallStep[]} [steps] - Tool call steps in new format
 */

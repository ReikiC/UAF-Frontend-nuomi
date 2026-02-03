import { useState } from 'react';

/**
 * Component for displaying a single tool call step with expand/collapse functionality
 * @param {Object} props
 * @param {string} props.tool_name - Name of the tool
 * @param {Object.<string, any>} props.arguments - Tool arguments
 * @param {string} props.result - Tool execution result
 * @param {'success' | 'error'} props.status - Execution status
 */
export const ToolCallStep = ({ tool_name, arguments: args, result, status }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResultExpanded, setIsResultExpanded] = useState(false);

  const statusColor = status === 'success' ? '#10b981' : '#ef4444';
  const statusIcon = status === 'success' ? '✓' : '✕';

  // Format JSON for display
  const formatJson = (obj) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  return (
    <div className="tool-call-step">
      <div
        className="tool-call-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <span className="tool-call-icon">{isExpanded ? '▼' : '▶'}</span>
        <span className="tool-call-name">{tool_name}</span>
        <span
          className="tool-call-status"
          style={{ color: statusColor, marginLeft: 'auto' }}
        >
          {statusIcon} {status}
        </span>
      </div>

      {isExpanded && (
        <div className="tool-call-details">
          <div className="tool-call-section">
            <div
              className="tool-call-section-header"
              onClick={() => setIsResultExpanded(!isResultExpanded)}
            >
              <span className="section-icon">{isResultExpanded ? '▼' : '▶'}</span>
              <span className="section-title">参数</span>
            </div>
            {isResultExpanded && (
              <pre className="tool-call-code">
                {formatJson(args)}
              </pre>
            )}
          </div>

          <div className="tool-call-section">
            <div className="section-title">结果</div>
            <pre className="tool-call-result">{result}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Component for displaying all tool call steps
 * @param {Array<{tool_name: string, arguments: Object, result: string, status: string}>} props.steps
 */
export const ToolCallSteps = ({ steps }) => {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="tool-call-steps">
      <div className="tool-call-steps-header">
        <span className="steps-icon">⚙️</span>
        <span>执行步骤 ({steps.length})</span>
      </div>
      {steps.map((step, index) => (
        <ToolCallStep key={index} {...step} />
      ))}
    </div>
  );
};

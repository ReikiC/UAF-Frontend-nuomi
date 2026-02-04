import { useState, useEffect } from 'react';
import { fetchApiEndpoints } from '../lib/api';

/**
 * API Selector component with dropdown
 * Dynamically loads available endpoints from backend
 */
export const ApiSelector = ({ currentApi, onApiChange }) => {
  const [endpoints, setEndpoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApiEndpoints()
      .then(data => {
        setEndpoints(data.endpoints);
        // Set default if not set
        if (!currentApi && data.default) {
          onApiChange(data.default);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load endpoints:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="api-selector">
        <div className="api-selector-loading">加载端点...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="api-selector">
        <div className="api-selector-error">加载失败: {error}</div>
      </div>
    );
  }

  if (!endpoints) {
    return null;
  }

  // Group endpoints by category
  const grouped = Object.entries(endpoints).reduce((acc, [key, meta]) => {
    const category = meta.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push({ key, ...meta });
    return acc;
  }, {});

  return (
    <div className="api-selector">
      <select
        value={currentApi || Object.keys(endpoints)[0]}
        onChange={(e) => onApiChange(e.target.value)}
        className="api-selector-dropdown"
      >
        {Object.entries(grouped).map(([category, items]) => (
          <optgroup key={category} label={category === 'basic' ? '基础聊天' : category === 'agent' ? 'Agent 聊天' : category}>
            {items.map(({ key, label, description }) => (
              <option key={key} value={key} title={description}>
                {label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {currentApi && endpoints[currentApi] && (
        <div className="api-selector-description">
          {endpoints[currentApi].description}
          {endpoints[currentApi].streaming && (
            <span className="api-badge streaming">流式</span>
          )}
        </div>
      )}
    </div>
  );
};

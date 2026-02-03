import { useState, useCallback } from 'react';
import './App.css';

// Components - using composition pattern
// See: architecture-compound-components
import { ChatHeader } from './components/ChatHeader';
import { ApiSelector, API_ENDPOINTS } from './components/ApiSelector';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';

// API client with proper error handling
import { sendChatMessage } from './lib/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentApi, setCurrentApi] = useState('smart');
  const [loading, setLoading] = useState(false);

  // Use functional setState for stable callbacks
  // See: rerender-functional-setstate
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput(''); // Clear input first for better UX
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await sendChatMessage(API_ENDPOINTS[currentApi], userMessage);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Error: ' + error.message }
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, currentApi]);

  const handleApiChange = useCallback((api) => {
    setCurrentApi(api);
  }, []);

  const handleInputChange = useCallback((value) => {
    setInput(value);
  }, []);

  return (
    <div className="chat-container">
      <ChatHeader />
      <ApiSelector currentApi={currentApi} onApiChange={handleApiChange} />
      <MessageList messages={messages} loading={loading} />
      <MessageInput
        input={input}
        onInputChange={handleInputChange}
        onSend={sendMessage}
        loading={loading}
      />
    </div>
  );
}

export default App;

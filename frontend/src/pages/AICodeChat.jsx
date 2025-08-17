import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const AICodeChat = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get('/ai/chat-history');
      setChatHistory(response.data);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/ai/chat', {
        prompt,
        options: {
          max_tokens: 1024,
          temperature: 0.7
        },
        chatHistoryId: currentChatId
      });

      setCurrentResponse(response.data);
      
             if (response.data.isNewChat) {
         // Add new chat to history
         setChatHistory(prev => [{
           id: response.data.chatHistoryId,
           title: response.data.title,
           createdAt: response.data.timestamp,
           ChatMessages: [
             {
               prompt: prompt,
               response: prompt, // User message
               type: 'message',
               language: null,
               isUserMessage: true,
               createdAt: response.data.timestamp
             },
             {
               prompt: prompt,
               response: response.data.result,
               type: response.data.type,
               language: response.data.language,
               isUserMessage: false,
               createdAt: response.data.timestamp
             }
           ]
         }, ...prev]);
         setCurrentChatId(response.data.chatHistoryId);
       } else {
         // Update existing chat - add both user message and AI response
         const newMessages = [
           {
             prompt: prompt,
             response: prompt, // User message
             type: 'message',
             language: null,
             isUserMessage: true,
             createdAt: response.data.timestamp
           },
           {
             prompt: prompt,
             response: response.data.result,
             type: response.data.type,
             language: response.data.language,
             isUserMessage: false,
             createdAt: response.data.timestamp
           }
         ];

         setChatHistory(prev => prev.map(chat => 
           chat.id === response.data.chatHistoryId 
             ? {
                 ...chat,
                 ChatMessages: [...chat.ChatMessages, ...newMessages]
               }
             : chat
         ));
         
         // Update selected chat if it's the current one
         if (selectedChat && selectedChat.id === response.data.chatHistoryId) {
           setSelectedChat({
             ...selectedChat,
             ChatMessages: [...selectedChat.ChatMessages, ...newMessages]
           });
         }
       }
      
      setPrompt('');
    } catch (err) {
      console.error('Error generating code:', err);
      setError('Failed to generate response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = async (chatId) => {
    try {
      const response = await axios.get(`/ai/chat/${chatId}`);
      setSelectedChat(response.data);
      setCurrentChatId(chatId);
      setCurrentResponse(null);
    } catch (err) {
      console.error('Error fetching chat:', err);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await axios.delete(`/ai/chat/${chatId}`);
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        if (selectedChat && selectedChat.id === chatId) {
          setSelectedChat(null);
        }
      } catch (err) {
        console.error('Error deleting chat:', err);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Show success message
    const button = document.getElementById('copyButton');
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'bg-yellow-100 text-yellow-800',
      python: 'bg-blue-100 text-blue-800',
      java: 'bg-red-100 text-red-800',
      cpp: 'bg-purple-100 text-purple-800',
      csharp: 'bg-green-100 text-green-800',
      php: 'bg-indigo-100 text-indigo-800',
      ruby: 'bg-red-100 text-red-800',
      go: 'bg-cyan-100 text-cyan-800',
      rust: 'bg-orange-100 text-orange-800',
      sql: 'bg-gray-100 text-gray-800',
      html: 'bg-orange-100 text-orange-800',
      css: 'bg-blue-100 text-blue-800',
      typescript: 'bg-blue-100 text-blue-800',
      react: 'bg-cyan-100 text-cyan-800',
      vue: 'bg-green-100 text-green-800',
      jsx: 'bg-cyan-100 text-cyan-800',
      tsx: 'bg-blue-100 text-blue-800',
      text: 'bg-gray-100 text-gray-800'
    };
    return colors[language] || colors.text;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'code': return '💻';
      case 'message': return '💬';
      case 'mixed': return '🔀';
      default: return '💬';
    }
  };

  const renderChatMessages = (chat) => {
    if (!chat || !chat.ChatMessages) return null;

    return (
      <div className="space-y-6">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">💬</span>
            <h3 className="text-xl font-bold text-gray-900">{chat.title || 'Chat Session'}</h3>
          </div>
          <p className="text-gray-600 text-sm">
            {formatDate(chat.createdAt)}
          </p>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4">
          {chat.ChatMessages.map((message, index) => (
            <div key={index} className={`flex ${message.isUserMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.isUserMessage ? 'bg-blue-100' : 'bg-white'} rounded-xl p-4 border border-gray-200`}>
                {!message.isUserMessage && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getTypeIcon(message.type)}</span>
                    {message.language && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(message.language)}`}>
                        {message.language.toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">
                    {message.isUserMessage ? 'You' : 'AI Assistant'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(message.createdAt)}
                  </p>
                </div>

                                 {message.isUserMessage ? (
                   <p className="text-gray-900">{message.prompt}</p>
                 ) : (
                   <div>
                     {message.type === 'code' ? (
                       <div>
                         <div className="flex items-center justify-between mb-3">
                           <h4 className="text-lg font-semibold text-gray-900">Code</h4>
                           <button
                             onClick={() => copyToClipboard(message.response)}
                             className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors duration-200 font-medium text-sm flex items-center gap-1"
                           >
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                             </svg>
                             Copy
                           </button>
                         </div>
                         <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto border border-gray-700">
                           <pre className="text-sm text-green-400 leading-relaxed whitespace-pre-wrap">
                             <code>{message.response}</code>
                           </pre>
                         </div>
                       </div>
                     ) : message.type === 'mixed' ? (
                       <div className="space-y-4">
                         {/* Extract and display text content */}
                         {(() => {
                           const textContent = message.response.replace(/```[\w]*\n[\s\S]*?\n```/g, '').trim();
                           if (textContent) {
                             return (
                               <div className="prose prose-gray max-w-none">
                                 <p className="text-gray-700 whitespace-pre-wrap">{textContent}</p>
                               </div>
                             );
                           }
                           return null;
                         })()}
                         
                         {/* Extract and display code blocks */}
                         {(() => {
                           const codeBlocks = message.response.match(/```[\w]*\n[\s\S]*?\n```/g);
                           if (codeBlocks) {
                             return codeBlocks.map((block, index) => {
                               const language = block.match(/```(\w+)/)?.[1] || 'text';
                               const code = block.replace(/```[\w]*\n/, '').replace(/\n```$/, '');
                               
                               return (
                                 <div key={index}>
                                   <div className="flex items-center justify-between mb-3">
                                     <h4 className="text-lg font-semibold text-gray-900">Code ({language})</h4>
                                     <button
                                       onClick={() => copyToClipboard(code)}
                                       className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors duration-200 font-medium text-sm flex items-center gap-1"
                                     >
                                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                       </svg>
                                       Copy
                                     </button>
                                   </div>
                                   <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto border border-gray-700">
                                     <pre className="text-sm text-green-400 leading-relaxed whitespace-pre-wrap">
                                       <code>{code}</code>
                                     </pre>
                                   </div>
                                 </div>
                               );
                             });
                           }
                           return null;
                         })()}
                       </div>
                     ) : (
                       <div className="prose prose-gray max-w-none">
                         <p className="text-gray-700 whitespace-pre-wrap">{message.response}</p>
                       </div>
                     )}
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex gap-6">
      {/* Left Panel - Chat Form & History */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Code Assistant</h2>
          <p className="text-gray-600">Get help with coding tasks, debugging, and best practices</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-shrink-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your coding needs
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a React component for user login form with validation, or help me debug this JavaScript function..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 resize-none"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Response...
              </div>
            ) : (
              'Send Message'
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Chat History */}
        <div className="mt-8 flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Chat History</h3>
            <button
              onClick={() => {
                setSelectedChat(null);
                setCurrentResponse(null);
                setCurrentChatId(null);
              }}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              New Chat
            </button>
          </div>
          <div className="space-y-3 h-full overflow-y-auto">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">No chat history yet</p>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                    (selectedChat?.id === chat.id || currentResponse?.id === chat.id) ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                  }`}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(chat.type)}</span>
                      <span className="text-xs text-gray-500">{formatDate(chat.createdAt)}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-900 mb-2 font-medium line-clamp-2">
                    {chat.title || 'Chat Session'}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {chat.ChatMessages && chat.ChatMessages.length > 0 
                      ? chat.ChatMessages[0].prompt.substring(0, 50) + '...'
                      : 'No messages yet'
                    }
                  </p>
                  {chat.ChatMessages && chat.ChatMessages.length > 0 && chat.ChatMessages[0].language && (
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(chat.ChatMessages[0].language)}`}>
                      {chat.ChatMessages[0].language.toUpperCase()}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Response Display */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Response</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Generating response...</p>
                <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
              </div>
            </div>
          ) : selectedChat ? (
            renderChatMessages(selectedChat)
          ) : (
            <div className="text-center text-gray-500 py-16">
              <div className="text-6xl mb-4">💻</div>
              <p className="text-xl font-medium text-gray-900 mb-2">Your AI response will appear here</p>
              <p className="text-gray-600">Start a new conversation or select from chat history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICodeChat; 
import React, { useState } from 'react';

const AICodeChat = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeResult, setCodeResult] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      prompt: 'Create a React component for user login form',
      result: 'Here\'s a React login form component with validation...',
      timestamp: '2024-01-15 14:20'
    }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const mockResult = {
        title: 'React Login Form Component',
        description: 'A complete React component for user authentication with form validation and error handling.',
        code: `import React, { useState } from 'react';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation logic here
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;`,
        explanation: [
          'The component uses React hooks (useState) for state management',
          'Form validation is handled with controlled inputs',
          'Error handling is implemented for better user experience',
          'Responsive design with Tailwind CSS classes',
          'Accessibility features like proper labels and form structure'
        ],
        language: 'jsx',
        complexity: 'Intermediate',
        estimatedTime: '15-20 minutes'
      };
      
      setCodeResult(mockResult);
      setChatHistory(prev => [{
        id: Date.now(),
        prompt,
        result: mockResult.title,
        timestamp: new Date().toLocaleString()
      }, ...prev]);
      setIsLoading(false);
    }, 2000);
  };

  const copyCode = () => {
    if (codeResult) {
      navigator.clipboard.writeText(codeResult.code);
      // Show success message
      const button = document.getElementById('copyButton');
      if (button) {
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = 'Copy Code';
        }, 2000);
      }
    }
  };

  const exportCode = () => {
    if (codeResult) {
      const blob = new Blob([codeResult.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${codeResult.title.replace(/\s+/g, '_')}.${codeResult.language}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Left Panel - Chat Form */}
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
              rows={6}
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
                Generating Code...
              </div>
            ) : (
              'Generate Code'
            )}
          </button>
        </form>

        {/* Chat History */}
        <div className="mt-8 flex-1 overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat History</h3>
          <div className="space-y-3 h-full overflow-y-auto">
            {chatHistory.map((chat) => (
              <div key={chat.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{chat.timestamp}</span>
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    Use Again
                  </button>
                </div>
                <p className="text-sm text-gray-900 mb-2 font-medium">
                  <span className="text-gray-600">Prompt:</span> {chat.prompt}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="text-gray-600">Result:</span> {chat.result}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Code Result */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Generated Code</h2>
          {codeResult && (
            <div className="flex gap-3">
              <button
                id="copyButton"
                onClick={copyCode}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Code
              </button>
              <button
                onClick={exportCode}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Generating your code...</p>
                <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
              </div>
            </div>
          ) : codeResult ? (
            <div className="space-y-6">
              {/* Code Title and Description */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{codeResult.title}</h3>
                <p className="text-gray-700 mb-4">{codeResult.description}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-gray-600">Language:</span>
                    <span className="text-gray-900 font-medium ml-2 uppercase">{codeResult.language}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-gray-600">Complexity:</span>
                    <span className="text-gray-900 font-medium ml-2">{codeResult.complexity}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-gray-600">Est. Time:</span>
                    <span className="text-gray-900 font-medium ml-2">{codeResult.estimatedTime}</span>
                  </div>
                </div>
              </div>

              {/* Code Block */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">Generated Code</h4>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {codeResult.language.toUpperCase()}
                  </span>
                </div>
                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto border border-gray-700">
                  <pre className="text-sm text-green-400 leading-relaxed">
                    <code>{codeResult.code}</code>
                  </pre>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Code Explanation</h4>
                <div className="space-y-3">
                  {codeResult.explanation.map((point, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Tips */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">💡 Usage Tips</h4>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Copy the code and paste it into your project</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Customize the styling and functionality as needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Test thoroughly before deploying to production</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">
              <div className="text-6xl mb-4">💻</div>
              <p className="text-xl font-medium text-gray-900 mb-2">Your generated code will appear here</p>
              <p className="text-gray-600">Start by describing your coding needs on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICodeChat; 
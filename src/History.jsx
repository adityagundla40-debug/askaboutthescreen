import { useState, useEffect } from 'react';
import { databaseService } from './appwrite';

function History({ user, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await databaseService.getUserHistory(user.$id, 20);
      if (result.success) {
        setHistory(result.documents);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    const result = await databaseService.deleteActivity(documentId);
    if (result.success) {
      setHistory(history.filter(item => item.$id !== documentId));
    } else {
      setError(result.error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all history?')) {
      return;
    }
    
    const result = await databaseService.clearUserHistory(user.$id);
    if (result.success) {
      setHistory([]);
    } else {
      setError(result.error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getActionIcon = (action) => {
    const icons = {
      'capture_screenshot': '📸',
      'execute_command': '🎮',
      'analyze_screen': '🤖',
      'voice_command': '🎙️',
      'multi_capture': '📸+',
      'wake_word': '👂',
      'settings_change': '⚙️'
    };
    return icons[action] || '📝';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">📜 Activity History</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          ← Back
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-400">
          Showing last {history.length} activities
        </p>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">⏳ Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 bg-gray-800 border border-gray-700 rounded-lg">
          <p className="text-gray-400 mb-2">📭 No activity history yet</p>
          <p className="text-sm text-gray-500">
            Your activities will appear here as you use the extension
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            let parsedData = {};
            try {
              parsedData = JSON.parse(item.data);
            } catch (e) {
              parsedData = { raw: item.data };
            }

            return (
              <div
                key={item.$id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getActionIcon(item.action)}</span>
                    <div>
                      <h3 className="font-semibold capitalize">
                        {item.action.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.$id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-2 p-2 bg-gray-700 rounded text-sm">
                  {parsedData.prompt && (
                    <p className="text-gray-300 mb-1">
                      <span className="font-semibold">Prompt:</span> {parsedData.prompt}
                    </p>
                  )}
                  {parsedData.command && (
                    <p className="text-gray-300 mb-1">
                      <span className="font-semibold">Command:</span> {parsedData.command}
                    </p>
                  )}
                  {parsedData.response && (
                    <p className="text-gray-300 mb-1">
                      <span className="font-semibold">Response:</span>{' '}
                      {parsedData.response.substring(0, 100)}
                      {parsedData.response.length > 100 ? '...' : ''}
                    </p>
                  )}
                  {parsedData.imageCount && (
                    <p className="text-gray-300">
                      <span className="font-semibold">Images:</span> {parsedData.imageCount}
                    </p>
                  )}
                  {parsedData.mode && (
                    <p className="text-gray-300">
                      <span className="font-semibold">Mode:</span> {parsedData.mode}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={loadHistory}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        🔄 Refresh History
      </button>
    </div>
  );
}

export default History;

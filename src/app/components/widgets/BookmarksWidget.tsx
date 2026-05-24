import { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Globe } from 'lucide-react';

interface Bookmark {
  id: string;
  title: string;
  url: string;
}

export function BookmarksWidget({ id }: { id: string }) {
  const storageKey = `pc-home-bookmarks-${id}`;
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [
        { id: '1', title: 'Google', url: 'https://google.com' },
        { id: '2', title: 'GitHub', url: 'https://github.com' },
        { id: '3', title: 'YouTube', url: 'https://youtube.com' },
      ];
    } catch { return []; }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(bookmarks));
  }, [bookmarks, storageKey]);

  const addBookmark = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    const url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    setBookmarks(prev => [...prev, { id: Date.now().toString(), title: newTitle.trim(), url }]);
    setNewTitle('');
    setNewUrl('');
    setShowAdd(false);
  };

  const removeBookmark = (bmId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bmId));
  };

  return (
    <div>
      <div className="space-y-2 max-h-52 overflow-y-auto mb-3">
        {bookmarks.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">No bookmarks</p>
        ) : (
          bookmarks.map(bm => (
            <div key={bm.id} className="flex items-center gap-2 group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <a
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 truncate"
              >
                {bm.title}
              </a>
              <a
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => removeBookmark(bm.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {showAdd ? (
        <div className="space-y-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-3 py-1.5 text-sm rounded-lg border bg-transparent border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addBookmark()}
            placeholder="URL (e.g. google.com)"
            className="w-full px-3 py-1.5 text-sm rounded-lg border bg-transparent border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <div className="flex gap-2">
            <button onClick={addBookmark} className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Add
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Bookmark
        </button>
      )}
    </div>
  );
}

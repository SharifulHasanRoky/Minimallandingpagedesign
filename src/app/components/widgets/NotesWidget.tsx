import { useState, useEffect } from 'react';

export function NotesWidget({ id }: { id: string }) {
  const storageKey = `pc-home-notes-${id}`;
  const [note, setNote] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || '';
    } catch { return ''; }
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(storageKey, note);
    }, 500);
    return () => clearTimeout(timeout);
  }, [note, storageKey]);

  const wordCount = note.trim() ? note.trim().split(/\s+/).length : 0;
  const charCount = note.length;

  return (
    <div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Type your notes here... (auto-saved)"
        className="w-full h-40 p-3 text-sm rounded-xl border bg-transparent resize-none
          border-gray-200 dark:border-gray-600 
          text-gray-800 dark:text-gray-200 
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      />
      <div className="flex justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
        <span>{wordCount} words</span>
        <span>{charCount} chars • Auto-saved</span>
      </div>
    </div>
  );
}

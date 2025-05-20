import React from "react";

interface SidebarProps {
  editors: { id: number, title?: string }[];
  selectedNoteId: number;
  setSelectedNoteId: (id: number) => void;
}

export default function Sidebar({ editors, selectedNoteId, setSelectedNoteId }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-900 h-full p-4 shadow-md">
      <h2 className="text-lg font-bold mb-4">Notes</h2>
      <ul className="space-y-2">
        {editors.map((editor, idx) => (
          <li
            key={editor.id}
            className={`p-2 rounded-md shadow-sm cursor-pointer transition-colors
              ${selectedNoteId === editor.id
                ? "bg-blue-500 text-white dark:bg-blue-400"
                : "bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"}
            `}
            onClick={() => setSelectedNoteId(editor.id)}
          >
            {editor.title && editor.title.trim() !== '' ? editor.title : `Note ${editor.id}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
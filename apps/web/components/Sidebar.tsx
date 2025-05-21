import React from "react";

interface Editor {
  id: string;
  title: string;
  content: any;
  isShared?: boolean;
  user?: {
    name: string | null;
    email: string;
  };
}

interface SidebarProps {
  editors: Editor[];
  selectedNoteId: string;
  setSelectedNoteId: (id: string) => void;
}

export default function Sidebar({ editors, selectedNoteId, setSelectedNoteId }: SidebarProps) {
  const ownedNotes = editors.filter(editor => !editor.isShared);
  const sharedNotes = editors.filter(editor => editor.isShared);

  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-900 h-full p-4 shadow-md">
      <h2 className="text-lg font-bold mb-4">Notes</h2>
      
      {/* Owned Notes */}
      {ownedNotes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">My Notes</h3>
          <ul className="space-y-2">
            {ownedNotes.map((editor) => (
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
      )}

      {/* Shared Notes */}
      {sharedNotes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Shared with Me</h3>
          <ul className="space-y-2">
            {sharedNotes.map((editor) => (
              <li
                key={editor.id}
                className={`p-2 rounded-md shadow-sm cursor-pointer transition-colors
                  ${selectedNoteId === editor.id
                    ? "bg-blue-500 text-white dark:bg-blue-400"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"}
                `}
                onClick={() => setSelectedNoteId(editor.id)}
              >
                <div className="flex flex-col">
                  <span>{editor.title && editor.title.trim() !== '' ? editor.title : `Note ${editor.id}`}</span>
                  <span className="text-xs text-muted-foreground">
                    by {editor.user?.name || editor.user?.email}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
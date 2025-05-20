"use client";

import { useState } from "react";
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { Button } from "@/components/tailwind/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/tailwind/ui/dialog";
import Menu from "@/components/tailwind/ui/menu";
import { ScrollArea } from "@/components/tailwind/ui/scroll-area";
import { BookOpen, GithubIcon } from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

const blankContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
};

export default function Page() {
  const [editors, setEditors] = useState([
    { id: 1, title: '', content: blankContent },
  ]);
  const [selectedNoteId, setSelectedNoteId] = useState(1);

  const addEditor = () => {
    const newId = editors.length ? editors[0].id + 1 : 1;
    setEditors((prev) => [
      { id: newId, title: '', content: blankContent },
      ...prev,
    ]);
    setSelectedNoteId(newId);
  };

  const handleTitleChange = (id: number, newTitle: string) => {
    setEditors((prev) =>
      prev.map((e) => (e.id === id ? { ...e, title: newTitle } : e))
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        editors={editors}
        selectedNoteId={selectedNoteId}
        setSelectedNoteId={setSelectedNoteId}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center gap-4 py-4 sm:px-5">
        {/* Top Bar */}
        <div className="flex w-full max-w-screen-lg items-center justify-between px-4">
          <div>
            <Button size="icon" variant="outline">
              <a href="https://github.com/steven-tey/novel" target="_blank" rel="noreferrer">
                <GithubIcon />
              </a>
            </Button>
          </div>
          <div>
            {/* Button to Add New Writing Area */}
            <Button variant="default" onClick={addEditor}>
              New Note
            </Button>
          </div>
        </div>

        {/* Writing Area for Selected Note */}
        <div className="flex flex-col w-full max-w-screen-lg gap-4 px-4">
          {editors
            .filter((editor) => editor.id === selectedNoteId)
            .map((editor) => (
              <div key={editor.id} className="border p-4 rounded-md shadow">
                <input
                  className="text-lg font-bold mb-2 bg-transparent outline-none border-b border-muted focus:border-blue-400 transition-colors mb-4"
                  value={editor.title || ''}
                  placeholder={`Note ${editor.id}`}
                  onChange={e => handleTitleChange(editor.id, e.target.value)}
                />
                <TailwindAdvancedEditor
                  initialContent={editor.content}
                  onContentChange={(newContent) => {
                    setEditors((prev) =>
                      prev.map((e) =>
                        e.id === editor.id ? { ...e, content: newContent } : e
                      )
                    );
                  }}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

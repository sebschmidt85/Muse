"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { Button } from "@/components/tailwind/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/tailwind/ui/dialog";
import Menu from "@/components/tailwind/ui/menu";
import { ScrollArea } from "@/components/tailwind/ui/scroll-area";
import { BookOpen, GithubIcon, LogOut } from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ShareNoteButton from "@/components/ShareNoteButton";

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editors, setEditors] = useState<Editor[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      // Fetch notes from the database
      fetch("/api/notes")
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            // Deduplicate notes by id
            const uniqueNotes = Array.from(
              new Map(data.map((note: any) => [note.id, note])).values()
            );
            setEditors(
              uniqueNotes.map((note: any) => ({
                id: note.id,
                title: note.title || '',
                content: note.content,
                isShared: note.isShared,
                user: note.user,
              }))
            );
            setSelectedNoteId(uniqueNotes[0].id);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch notes:", error);
        });
    }
  }, [session]);

  const addEditor = async () => {
    console.log('Creating new note...');
    try {
      console.log('Sending POST request to /api/notes');
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: '',
          content: blankContent,
        }),
      });

      console.log('Response status:', response.status);
      if (response.ok) {
        const savedNote = await response.json();
        console.log('Note created successfully:', savedNote);
        setEditors((prev) => [savedNote, ...prev]);
        setSelectedNoteId(savedNote.id);
      } else {
        const error = await response.json();
        console.error('Failed to create note:', error);
      }
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleTitleChange = async (id: string, newTitle: string) => {
    setEditors((prev) =>
      prev.map((e) => (e.id === id ? { ...e, title: newTitle } : e))
    );

    try {
      await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          content: editors.find((e) => e.id === id)?.content,
        }),
      });
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const handleContentChange = async (id: string, newContent: any) => {
    setEditors((prev) =>
      prev.map((e) => (e.id === id ? { ...e, content: newContent } : e))
    );

    try {
      const currentEditor = editors.find((e) => e.id === id);
      if (!currentEditor) return;

      await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: currentEditor.title,
          content: newContent,
        }),
      });
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

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
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline">
              <a href="https://github.com/steven-tey/novel" target="_blank" rel="noreferrer">
                <GithubIcon />
              </a>
            </Button>
            <Button size="icon" variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <div>
            {/* Button to Add New Writing Area */}
            <Button 
              variant="default" 
              onClick={() => {
                console.log('New Note button clicked');
                addEditor();
              }}
            >
              New Note
            </Button>
          </div>
        </div>

        {/* Writing Area for Selected Note */}
        <div className="flex flex-col w-full max-w-screen-lg gap-4 px-4">
          {editors
            .filter((editor) => editor.id === selectedNoteId)
            .map((editor) => {
              console.log('[EditorRender] noteId:', editor.id, 'currentUserId:', session.user.id, 'isOwner:', !editor.isShared, 'isShared:', editor.isShared, 'editor.user:', editor.user);
              return (
                <div key={editor.id} className="border p-4 rounded-md shadow">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      className="text-lg font-bold bg-transparent outline-none border-b border-muted focus:border-blue-400 transition-colors"
                      value={editor.title || ''}
                      placeholder={`Note ${editor.id}`}
                      onChange={e => handleTitleChange(editor.id, e.target.value)}
                    />
                    {!editor.isShared && <ShareNoteButton noteId={editor.id} />}
                  </div>
                  {editor.isShared && (
                    <div className="text-sm text-muted-foreground mb-4">
                      Shared by {editor.user?.name || editor.user?.email}
                    </div>
                  )}
                  <TailwindAdvancedEditor
                    key={editor.id}
                    initialContent={editor.content}
                    onContentChange={(newContent) => handleContentChange(editor.id, newContent)}
                    currentUserId={session.user.id}
                    isOwner={!editor.isShared}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

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

export default function Page() {
  const [editors, setEditors] = useState([1]); // State to manage multiple editors

  const addEditor = () => {
    setEditors((prev) => [...prev, prev.length + 1]); // Add a new editor
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

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
            <Button variant="primary" onClick={addEditor}>
              Add New Note Area
            </Button>
          </div>
        </div>

        {/* Writing Areas */}
        <div className="flex flex-col w-full max-w-screen-lg gap-4 px-4">
          {editors.map((editor, index) => (
            <div key={index} className="border p-4 rounded-md shadow">
              <h3 className="text-lg font-bold mb-2">Note {index + 1}</h3>
              <TailwindAdvancedEditor />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

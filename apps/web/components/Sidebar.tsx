import React from "react";

export default function Sidebar() {
  const folders = ["Folder 1", "Folder 2", "Folder 3"]; // Example folders

  return (
    <div className="w-64 bg-gray-100 h-full p-4 shadow-md">
      <h2 className="text-lg font-bold mb-4">Folders</h2>
      <ul className="space-y-2">
        {folders.map((folder, index) => (
          <li
            key={index}
            className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-200 cursor-pointer"
          >
            {folder}
          </li>
        ))}
      </ul>
    </div>
  );
}
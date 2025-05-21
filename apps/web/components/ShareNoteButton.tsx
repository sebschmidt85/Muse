import { useState } from "react";
import { Button } from "@/components/tailwind/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/tailwind/ui/dialog";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareNoteButtonProps {
  noteId: string;
}

export default function ShareNoteButton({ noteId }: ShareNoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to share note");
      }

      toast.success("Note shared successfully");
      setEmail("");
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to share note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Share with (email)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="user@example.com"
            />
          </div>
          <Button
            className="w-full"
            onClick={handleShare}
            disabled={loading || !email}
          >
            {loading ? "Sharing..." : "Share"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
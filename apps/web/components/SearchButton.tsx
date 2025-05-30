import { useState } from "react";
import { Button } from "@/components/tailwind/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/tailwind/ui/dialog";
import { Input } from "@/components/tailwind/ui/input";
import { Search, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/tailwind/ui/scroll-area";

export default function SearchButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setAnswer(null);
    setError(null);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      setError("Search failed. Please try again.");
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about your notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
          <ScrollArea className="h-[400px] pr-4">
            {isSearching && (
              <div className="text-center text-muted-foreground mt-8">Searching your notes with AI...</div>
            )}
            {answer && !isSearching && (
              <div className="mt-4 p-4 bg-accent/20 rounded text-base whitespace-pre-line">
                <div className="font-medium mb-2">AI Answer:</div>
                {answer}
              </div>
            )}
            {error && (
              <div className="text-center text-red-500 mt-8">{error}</div>
            )}
            {!answer && !isSearching && !error && (
              <div className="text-center text-muted-foreground mt-8">
                Ask a question to search across all your notes.
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
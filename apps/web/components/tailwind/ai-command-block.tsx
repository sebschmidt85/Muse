import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Play } from 'lucide-react';

console.log('[AICommandBlock] Node definition loaded');

// Custom AI Command Block Node
export const AICommandBlock = Node.create({
  name: 'aiCommandBlock',
  group: 'block',
  content: 'text*',
  defining: true,

  addAttributes() {
    return {
      isProcessing: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="ai-command-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, 'data-type': 'ai-command-block' }, 0];
  },

  addNodeView() {
    console.log('[AICommandBlock] addNodeView called');
    return ReactNodeViewRenderer(AICommandBlockComponent);
  },
});

// React Node View Component for AI Command Block
const AICommandBlockComponent = (props) => {
  console.log('[AICommandBlockComponent] rendered', props);
  const [isProcessing, setIsProcessing] = useState(false);
  const [value, setValue] = useState(props.node.textContent);
  const [answer, setAnswer] = useState<string | null>(null);

  const handleRun = async () => {
    console.log('[AICommandBlockComponent] Run button clicked', value);
    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: value,
          context: props.editor.storage.markdown.getMarkdown(),
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAnswer(data.response);
    } catch (error) {
      console.error('[AICommandBlockComponent] AI command error:', error);
      setAnswer('Error: Failed to get AI response. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <NodeViewWrapper className="ai-command-block bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
      <div className="flex flex-col gap-0 p-0">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isProcessing}
          placeholder="Ask the AI anything..."
          className="w-full min-h-[64px] resize-none rounded-t-lg border-0 bg-stone-50 px-4 py-3 text-base text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition disabled:opacity-60 font-sans"
        />
        <div className="flex justify-end px-4 pb-3 pt-1">
          <Button
            size="sm"
            className="flex items-center gap-1 bg-stone-100 text-stone-700 border border-stone-300 shadow-none hover:bg-stone-200 hover:text-primary transition rounded-md px-3 py-1.5 text-sm font-medium"
            onClick={handleRun}
            disabled={isProcessing}
            style={{ boxShadow: 'none' }}
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-400"></div>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Run
              </>
            )}
          </Button>
        </div>
        {answer && (
          <>
            <div className="border-t border-stone-200" />
            <div className="bg-stone-50 px-4 py-4 text-base text-stone-800 font-sans rounded-b-lg">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-400">AI Answer</div>
              <div className="whitespace-pre-line leading-relaxed">{answer}</div>
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}; 
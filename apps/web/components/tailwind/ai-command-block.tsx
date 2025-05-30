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
      // Insert the question and the AI answer into the editor, both marked as AI
      props.editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'text',
            text: 'Q: ' + value + '\n',
            marks: [{ type: 'ai-highlight', attrs: { color: '#2563eb' } }], // darker blue for question
          },
          {
            type: 'text',
            text: 'A: ' + data.response + '\n',
            marks: [{ type: 'ai-highlight', attrs: { color: '#3b82f6' } }], // lighter blue for answer
          },
        ])
        .run();
    } catch (error) {
      console.error('[AICommandBlockComponent] AI command error:', error);
      setAnswer('Error: Failed to get AI response. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <NodeViewWrapper className="ai-command-block bg-[#18182a] border border-border rounded-xl p-6 overflow-hidden">
      <div className="flex flex-col gap-0">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isProcessing}
          placeholder="Ask the AI anything..."
          className="w-full min-h-[64px] resize-none rounded-lg border-0 bg-background text-text p-3 text-base focus:outline-none focus:ring-2 focus:ring-accent/30 transition disabled:opacity-60 font-sans"
        />
        <div className="flex justify-end pt-3">
          <Button
            size="sm"
            className="bg-accent text-white rounded-full px-5 py-2 font-semibold hover:bg-accent/80 transition shadow-none border border-border flex items-center gap-1"
            onClick={handleRun}
            disabled={isProcessing}
            style={{ boxShadow: 'none' }}
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                Run
              </>
            )}
          </Button>
        </div>
        {answer && (
          <>
            <div className="border-t border-border my-2" />
            <div className="bg-background px-4 py-4 text-base text-text font-sans rounded-b-lg">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">AI Answer</div>
              <div className="whitespace-pre-line leading-relaxed">{answer}</div>
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}; 
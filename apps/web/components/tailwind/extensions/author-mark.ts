import { Mark, mergeAttributes } from '@tiptap/core';

export const AuthorMark = Mark.create({
  name: 'author',

  addOptions() {
    return {
      HTMLAttributes: {},
      currentUserId: null, // Pass this from the editor setup
    };
  },

  addAttributes() {
    return {
      author: {
        default: null,
        parseHTML: (element) => {
          let val = element.getAttribute('data-author');
          if (typeof val === 'string') val = val.replace(/^[\s"']+|[\s"']+$/g, '');
          return val;
        },
        renderHTML: (attributes) => {
          const authorId = attributes.author;
          return {
            'data-author': authorId,
            class: authorId ? `author-${authorId}` : undefined,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-author]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, mark }) {
    const author = mark.attrs.author;
    const currentUserId = this.options.currentUserId;
    const isCurrentUser = author === currentUserId;
    const className = isCurrentUser ? 'author-__CURRENT_USER__' : `author-${author}`;
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      'data-author': author,
      class: className,
    }), 0];
  },

  // For React rendering (optional, if using ReactNodeViewRenderer)
  addProseMirrorPlugins() {
    // No-op for now
    return [];
  },
}); 
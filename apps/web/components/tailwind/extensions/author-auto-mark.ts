import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { ReplaceStep } from 'prosemirror-transform';

export const AuthorAutoMark = Extension.create({
  name: 'author-auto-mark',
  addOptions() {
    return {
      currentUserId: null,
      isOwner: true, // still passed but not used for retroactive marking
    };
  },
  addProseMirrorPlugins() {
    // Always clean the userId before use
    const cleanId = (val) => (val ?? '').replace(/^[\s"']+|[\s"']+$/g, '');
    const { currentUserId } = this.options;
    const cleanedUserId = cleanId(currentUserId);
    return [
      new Plugin({
        appendTransaction: (transactions, oldState, newState) => {
          let tr = newState.tr;
          let modified = false;
          transactions.forEach(transaction => {
            transaction.steps.forEach(step => {
              if (step instanceof ReplaceStep) {
                const replaceStep = step as ReplaceStep;
                if (replaceStep.slice && replaceStep.slice.content && replaceStep.slice.content.childCount > 0) {
                  let pos = replaceStep.from;
                  replaceStep.slice.content.forEach((node) => {
                    if (node.isText && cleanedUserId) {
                      // Always override with the current user's cleaned author mark
                      tr = tr.removeMark(pos, pos + node.nodeSize, newState.schema.marks.author);
                      tr = tr.addMark(pos, pos + node.nodeSize, newState.schema.marks.author.create({ author: cleanedUserId }));
                      modified = true;
                    }
                    pos += node.nodeSize;
                  });
                }
              }
            });
          });
          return modified ? tr : null;
        },
      }),
    ];
  },
}); 
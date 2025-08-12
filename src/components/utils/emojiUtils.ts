import { EditorView } from "@codemirror/view";
import { EmojiClickData } from "emoji-picker-react";

export const handleEmojiSelect = (emojiData: EmojiClickData, editorRef: React.RefObject<EditorView | null>, onContentChange: (value: string) => void) => {
  if (!editorRef.current) return;
  const editor = editorRef.current;
  const state = editor.state;
  const selection = state.selection.main;
  const insertText = emojiData.emoji;
  const transaction = state.update({
    changes: { from: selection.from, to: selection.to, insert: insertText },
    selection: { anchor: selection.from + insertText.length },
  });
  editor.dispatch(transaction);
  editor.focus();
  onContentChange(editor.state.doc.toString());
};
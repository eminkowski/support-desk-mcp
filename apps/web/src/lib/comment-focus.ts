export const commentTextareaRef = { current: null as HTMLTextAreaElement | null };

export function focusCommentBox(): void {
  commentTextareaRef.current?.focus();
}

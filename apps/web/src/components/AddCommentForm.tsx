import { useEffect, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { useAddComment } from '../features/tickets/queries.js';
import { commentTextareaRef } from '../lib/comment-focus.js';
import { sectionHeadingClass } from '../lib/styles.js';

interface AddCommentFormProps {
  ticketId: string;
}

export function AddCommentForm({ ticketId }: AddCommentFormProps) {
  const { proposedAction } = useWorkspace();
  const [body, setBody] = useState('');
  const addComment = useAddComment(ticketId);
  const proposalPending = Boolean(proposedAction && proposedAction.ticketId === ticketId);

  useEffect(() => {
    if (proposalPending) {
      setBody('');
    }
  }, [proposalPending]);

  return (
    <form
      className="px-5 py-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (proposalPending) return;
        const text = body.trim();
        if (!text || addComment.isPending) return;

        addComment.mutate(text, {
          onSuccess: () => setBody(''),
        });
      }}
    >
      <label className="block">
        <span className={sectionHeadingClass}>Add internal comment</span>
        <textarea
          ref={(element) => {
            commentTextareaRef.current = element;
          }}
          rows={2}
          className="mt-2 w-full resize-y border border-[var(--color-line-subtle)] bg-[var(--color-workspace)] px-3 py-2 text-sm leading-relaxed outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-paper)]"
          placeholder={
            proposalPending
              ? 'Review the proposed comment above before adding another note'
              : 'Add a note for the support team'
          }
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={addComment.isPending || proposalPending}
        />
      </label>
      <div className="mt-2.5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={addComment.isPending || !body.trim() || proposalPending}
          className="border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition enabled:hover:opacity-90 disabled:opacity-40"
        >
          {addComment.isPending ? 'Saving…' : 'Save comment'}
        </button>
        {addComment.isError ? (
          <p className="text-xs text-[#b4533c]">{addComment.error.message}</p>
        ) : (
          <p className="text-xs text-[var(--color-muted)]">
            {proposalPending
              ? 'Manual comments pause while a proposal awaits review.'
              : 'Saved to the ticket and recorded in activity.'}
          </p>
        )}
      </div>
    </form>
  );
}

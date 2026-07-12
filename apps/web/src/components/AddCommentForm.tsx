import { useState } from 'react';
import { useAddComment } from '../features/tickets/queries.js';

export function AddCommentForm({ ticketId }: { ticketId: string }) {
  const [body, setBody] = useState('');
  const addComment = useAddComment(ticketId);

  return (
    <form
      className="border-t border-[var(--color-line)] px-5 py-4"
      onSubmit={(event) => {
        event.preventDefault();
        const text = body.trim();
        if (!text || addComment.isPending) return;

        addComment.mutate(text, {
          onSuccess: () => setBody(''),
        });
      }}
    >
      <label className="block">
        <span className="font-mono text-[0.68rem] tracking-wide text-[var(--color-muted)] uppercase">
          Add internal comment
        </span>
        <textarea
          className="mt-2 min-h-24 w-full resize-y border border-[var(--color-line)] bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-[var(--color-accent)]"
          placeholder="Note for the team"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={addComment.isPending}
        />
      </label>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={addComment.isPending || !body.trim()}
          className="border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-white transition enabled:hover:opacity-90 disabled:opacity-40"
        >
          {addComment.isPending ? 'Saving...' : 'Save comment'}
        </button>
        {addComment.isError ? (
          <p className="text-xs text-[#b4533c]">{addComment.error.message}</p>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        Saved via REST. Appears in Tool log as{' '}
        <span className="font-mono text-[0.68rem]">web-ui</span>.
      </p>
    </form>
  );
}

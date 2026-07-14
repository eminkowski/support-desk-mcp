import type { ProposedCommentAction } from '@support-desk/shared';
import { DRAFT_COMMENT_LABEL } from '@support-desk/shared';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { askQueue } from '../features/assist/api.js';
import { useAddComment, useTicket } from '../features/tickets/queries.js';
import type { ActionConfirmResult } from '../lib/action-lifecycle.js';
import { cn } from '../lib/cn.js';
import { getDemoSimulations } from '../lib/demo-simulations.js';
import { isProposalStale } from '../lib/proposal-staleness.js';
import {
  elevatedCardClass,
  metaLabelClass,
  secondaryButtonClass,
  sectionHeadingClass,
} from '../lib/styles.js';

interface ActionReviewCardProps {
  action: ProposedCommentAction;
}

export function ActionReviewCard({ action }: ActionReviewCardProps) {
  const { setProposedAction, setActionConfirmResult } = useWorkspace();
  const ticketQuery = useTicket(action.ticketId);
  const [body, setBody] = useState(action.body);
  const [isEditing, setIsEditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const addComment = useAddComment(action.ticketId);
  const isLocked = addComment.isPending || addComment.isSuccess || isRegenerating;

  useEffect(() => {
    setBody(action.body);
    setIsEditing(false);
  }, [action.body]);

  const ticket = ticketQuery.data?.ticket;
  const simulations = getDemoSimulations();
  const isStale = simulations.staleTicket || (ticket ? isProposalStale(action, ticket) : false);

  function confirm() {
    const text = body.trim();
    if (!text || isLocked || isStale) return;

    addComment.mutate(text, {
      onSuccess: () => {
        setActionConfirmResult({
          ticketId: action.ticketId,
          kind: 'add_comment',
          body: text,
          confirmedAt: Date.now(),
        });
        setProposedAction(null);
        requestAnimationFrame(() => {
          document.getElementById('ticket-thread')?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        });
      },
    });
  }

  async function regenerate() {
    if (isLocked) return;
    setIsRegenerating(true);
    try {
      const result = await askQueue(DRAFT_COMMENT_LABEL, action.ticketId);
      if (result.proposedAction) {
        setProposedAction(result.proposedAction);
        setBody(result.proposedAction.body);
        setIsEditing(false);
      }
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <section
      className={cn(elevatedCardClass, 'border-[#c9923f]/40 bg-[#fdf8ef]')}
      aria-labelledby="action-review-heading"
    >
      <div className="border-b border-[#e8dcc8] px-4 py-3">
        <p className={cn(metaLabelClass, 'text-[#8a5a18]')}>Review proposed action</p>
        <h3
          id="action-review-heading"
          className="mt-1 text-base font-semibold text-[var(--color-ink)]"
        >
          Add internal comment
        </h3>
        <p className="mt-1 text-xs text-[var(--color-muted)]">{action.ticketSubject}</p>
      </div>

      <div className="space-y-4 px-4 py-4">
        {isStale ? (
          <div
            role="alert"
            className="border border-[#b4533c]/35 bg-[#fdf0ed] px-3 py-3 text-sm leading-relaxed text-[var(--color-ink)]/90"
          >
            <p className="font-medium text-[#8f3f2f]">
              This ticket changed after the comment was drafted
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              Review the latest thread before saving. Confirmation is blocked until you dismiss or
              regenerate this draft.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => {
                  document
                    .getElementById('ticket-activity')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
              >
                Review latest activity
              </button>
              <button
                type="button"
                disabled={isLocked}
                className={secondaryButtonClass}
                onClick={() => void regenerate()}
              >
                {isRegenerating ? 'Regenerating…' : 'Regenerate comment'}
              </button>
              <button
                type="button"
                className={cn(
                  secondaryButtonClass,
                  'enabled:hover:border-[#b4533c] enabled:hover:text-[#b4533c]',
                )}
                onClick={() => setProposedAction(null)}
              >
                Dismiss draft
              </button>
            </div>
          </div>
        ) : null}

        {isEditing ? (
          <label className="block">
            <span className={sectionHeadingClass}>Edit comment</span>
            <textarea
              className="mt-2 min-h-28 w-full resize-y border border-[var(--color-line)] bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-[var(--color-accent)]"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              disabled={isLocked}
            />
          </label>
        ) : (
          <div>
            <p className={sectionHeadingClass}>Preview</p>
            <blockquote className="mt-2 border-l-2 border-[#c9923f] bg-white/70 px-3 py-2.5 text-sm leading-relaxed text-[var(--color-ink)]">
              {body.trim()}
            </blockquote>
          </div>
        )}

        <div className="rounded border border-[#e8dcc8] bg-white/50 px-3 py-3 text-sm leading-relaxed text-[var(--color-ink)]/85">
          <p className="font-medium text-[var(--color-ink)]">Before confirming</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-[var(--color-muted)]">
            <li>This will add one internal comment to this ticket.</li>
            <li>No customer-facing message will be sent.</li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEditing ? (
            <button
              type="button"
              disabled={isLocked || !body.trim()}
              className={secondaryButtonClass}
              onClick={() => setIsEditing(false)}
            >
              Done editing
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={isLocked}
                className={secondaryButtonClass}
                onClick={() => setIsEditing(true)}
              >
                Edit comment
              </button>
              <button
                type="button"
                disabled={isLocked || !body.trim() || isStale}
                className={cn(
                  'border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-white transition',
                  'enabled:hover:opacity-90 disabled:opacity-40',
                )}
                onClick={confirm}
              >
                {addComment.isPending ? 'Saving…' : 'Confirm and save'}
              </button>
            </>
          )}
          <button
            type="button"
            disabled={isLocked}
            className={cn(
              secondaryButtonClass,
              'enabled:hover:border-[#b4533c] enabled:hover:text-[#b4533c]',
            )}
            onClick={() => setProposedAction(null)}
          >
            Cancel
          </button>
        </div>

        {addComment.isError ? (
          <div role="alert" className="space-y-2">
            <p className="text-sm font-medium text-[#b4533c]">Comment could not be saved</p>
            <p className="text-xs leading-relaxed text-[var(--color-muted)]">
              Nothing was added to the ticket. Try again, or edit the comment before retrying.
            </p>
            <button
              type="button"
              disabled={isLocked || !body.trim() || isStale}
              className={secondaryButtonClass}
              onClick={confirm}
            >
              Retry save
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ActionReviewCompletedCard({ result }: { result: ActionConfirmResult }) {
  const { setActionConfirmResult } = useWorkspace();
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    cardRef.current?.focus();
  }, []);

  return (
    <section
      ref={cardRef}
      tabIndex={-1}
      className={cn(
        'border border-[var(--color-accent)]/25 bg-[var(--color-accent-soft)]/30 outline-none',
        'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]/40',
      )}
      aria-labelledby="action-completed-heading"
    >
      <div className="px-4 py-4">
        <p className={metaLabelClass}>Saved</p>
        <h3
          id="action-completed-heading"
          className="mt-1 text-base font-semibold text-[var(--color-ink)]"
        >
          Internal comment saved
        </h3>
        <blockquote className="mt-3 border-l-2 border-[var(--color-accent)]/50 bg-[var(--color-workspace)]/80 px-3 py-2.5 text-sm leading-relaxed text-[var(--color-ink)]">
          {result.body}
        </blockquote>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          Added to the thread below ·{' '}
          <Link
            to="/activity"
            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            View activity record
          </Link>
        </p>
        <button
          type="button"
          className={cn(secondaryButtonClass, 'mt-3')}
          onClick={() => setActionConfirmResult(null)}
        >
          Dismiss
        </button>
      </div>
    </section>
  );
}

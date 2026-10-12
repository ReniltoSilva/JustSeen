import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { setReaction } from "../data/reactions";
import UserAvatar from "./UserAvatar";
import { NeutralIcon, ThumbDownIcon, ThumbUpIcon } from "./icons";

/* Each reaction has its own colour: green agree, grey unsure, red disagree */
const kinds = [
  {
    kind: "agree",
    label: "Agree",
    icon: <ThumbUpIcon />,
    idle: "text-agree/80 hover:bg-agree/10",
    active: "bg-agree/15 text-agree ring-1 ring-agree/40",
  },
  {
    kind: "unsure",
    label: "Not sure",
    icon: <NeutralIcon />,
    idle: "text-unsure/80 hover:bg-unsure/10",
    active: "bg-unsure/15 text-fg ring-1 ring-unsure/40",
  },
  {
    kind: "disagree",
    label: "Disagree",
    icon: <ThumbDownIcon />,
    idle: "text-disagree/80 hover:bg-disagree/10",
    active: "bg-disagree/15 text-disagree ring-1 ring-disagree/40",
  },
];

const iconFor = Object.fromEntries(kinds.map((item) => [item.kind, item]));

/* The agree / not sure / disagree buttons under a review, plus who reacted */
const ReactionBar = ({ review }) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState(review.reactions ?? []);
  /* Where the "who reacted" list sits on screen, or null when it's closed */
  const [whoPosition, setWhoPosition] = useState(null);
  const [saving, setSaving] = useState(false);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const isMine = user?.id === review.user_id;
  const mine = reactions.find((reaction) => reaction.user_id === user?.id)?.kind ?? null;
  const count = (kind) => reactions.filter((reaction) => reaction.kind === kind).length;

  /* The card hides anything that spills over its edges, so the list is drawn on
  top of the whole page instead and placed next to the faces: above them when
  there's room, otherwise below, and never off the side of the screen */
  const openWho = () => {
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 224;
    const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
    setWhoPosition(
      rect.top > 280
        ? { left, bottom: window.innerHeight - rect.top + 8 }
        : { left, top: rect.bottom + 8 },
    );
  };

  /* Close it on a click elsewhere, Escape, scrolling or resizing */
  useEffect(() => {
    if (!whoPosition) return;
    const close = () => setWhoPosition(null);
    const clickAway = (e) => {
      if (!popoverRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) close();
    };
    const escape = (e) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", clickAway);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", clickAway);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [whoPosition]);

  /* Clicking a reaction adds it, clicking it again takes it back, another one moves it */
  const react = async (kind) => {
    if (!user || isMine || saving) return;
    const next = mine === kind ? null : kind;
    const previous = reactions;

    /* Show it straight away, undo if saving fails */
    const others = reactions.filter((reaction) => reaction.user_id !== user.id);
    setReactions(next ? [...others, { user_id: user.id, kind: next, profile: user }] : others);
    setSaving(true);
    try {
      await setReaction(user.id, review.id, next);
    } catch (error) {
      console.error("Failed to save reaction:", error);
      setReactions(previous);
    } finally {
      setSaving(false);
    }
  };

  const reactors = reactions.filter((reaction) => reaction.profile);

  return (
    <div className="relative flex items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        {kinds.map(({ kind, label, icon, idle, active }) => (
          <button
            key={kind}
            type="button"
            onClick={() => react(kind)}
            disabled={isMine}
            aria-pressed={mine === kind}
            aria-label={`${label} (${count(kind)})`}
            title={isMine ? `${count(kind)} ${label.toLowerCase()} on your review` : label}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums transition-colors disabled:cursor-default disabled:hover:bg-transparent ${
              mine === kind ? active : idle
            }`}
          >
            {icon}
            {count(kind)}
          </button>
        ))}
      </div>

      {/* Stacked faces of people who reacted; tap to see the full list */}
      {reactors.length > 0 && (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (whoPosition ? setWhoPosition(null) : openWho())}
          aria-expanded={Boolean(whoPosition)}
          aria-label={`See who reacted (${reactors.length})`}
          title="See who reacted"
          className="flex -space-x-2 rounded-full p-0.5 transition hover:opacity-80"
        >
          {reactors.slice(0, 3).map((reaction) => (
            <span key={reaction.user_id} className="rounded-full ring-2 ring-panel">
              <UserAvatar user={reaction.profile} className="w-5" />
            </span>
          ))}
        </button>
      )}

      {whoPosition &&
        createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Who reacted"
          style={whoPosition}
          className="fixed z-50 w-56 rounded-xl border border-line bg-panel p-1.5 text-fg shadow-2xl"
        >
          <p className="px-2 py-1.5 text-xs font-semibold text-muted">Reactions</p>
          <ul className="max-h-60 overflow-y-auto">
            {reactors.map((reaction) => (
              <li key={reaction.user_id}>
                <Link
                  to={`/u/${reaction.profile.username}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-fg hover:bg-fg/5"
                >
                  <UserAvatar user={reaction.profile} className="w-6" />
                  <span className="flex-1 truncate">{reaction.profile.name}</span>
                  <span
                    className={
                      reaction.kind === "agree"
                        ? "text-agree"
                        : reaction.kind === "disagree"
                          ? "text-disagree"
                          : "text-unsure"
                    }
                    title={iconFor[reaction.kind]?.label}
                  >
                    {iconFor[reaction.kind]?.icon}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default ReactionBar;

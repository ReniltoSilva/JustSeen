import { Link } from "react-router-dom";

/* Friendly placeholder for pages with nothing to show yet, with up to two next steps */
const EmptyState = ({ emoji = "🍿", title, message, actions = [] }) => (
  <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
    <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-brand/25 to-fuchsia-500/20 text-4xl ring-1 ring-brand/20">
      {emoji}
    </div>
    <h2 className="mt-5 text-xl font-bold text-fg">{title}</h2>
    {message && <p className="mt-2 text-sm leading-relaxed text-soft">{message}</p>}
    {actions.length > 0 && (
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {actions.map((action, index) => (
          <Link
            key={action.to}
            to={action.to}
            className={
              index === 0
                ? "rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
                : "rounded-full bg-fg/[0.06] px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-fg/10"
            }
          >
            {action.label}
          </Link>
        ))}
      </div>
    )}
  </div>
);

export default EmptyState;

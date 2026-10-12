import { useId, useState } from "react";
import { passwordRules, passwordStrength } from "../auth/passwords";
import { CheckIcon, EyeIcon } from "./icons";

const strengthLabels = ["Too weak", "Weak", "Okay", "Good", "Strong"];
const strengthColors = ["bg-disagree", "bg-disagree", "bg-amber-500", "bg-agree", "bg-agree"];

/*
  Password field with a show/hide button. With `showRules`, it also shows a
  strength bar and a checklist that ticks off each rule as you type.
*/
const PasswordInput = ({ value, onChange, showRules = false, autoComplete, className = "" }) => {
  const [visible, setVisible] = useState(false);
  const rulesId = useId();
  const strength = passwordStrength(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-describedby={showRules ? rulesId : undefined}
          className={`${className} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg"
        >
          <span className={visible ? "opacity-100" : "opacity-70"}>
            <EyeIcon className="w-4 h-4" />
          </span>
        </button>
      </div>

      {showRules && (
        <div id={rulesId} className="flex flex-col gap-2" aria-live="polite">
          {/* Strength bar: four segments that fill and change colour */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    value && strength >= step ? strengthColors[strength] : "bg-fg/10"
                  }`}
                />
              ))}
            </div>
            <span className="w-16 text-right text-xs text-muted">{value ? strengthLabels[strength] : ""}</span>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
            {passwordRules.map((rule) => {
              const met = rule.test(value);
              return (
                <li
                  key={rule.id}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${met ? "text-agree" : "text-muted"}`}
                >
                  <span
                    className={`grid h-3.5 w-3.5 place-items-center rounded-full ${
                      met ? "bg-agree text-white" : "ring-1 ring-inset ring-fg/20"
                    }`}
                    aria-hidden="true"
                  >
                    {met && <CheckIcon className="w-2.5 h-2.5" />}
                  </span>
                  {rule.label}
                  <span className="sr-only">{met ? "(done)" : "(missing)"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;

import { useSyncExternalStore } from "react";
import DesktopDemo from "./demo/DesktopDemo";
import PhoneDemo from "./demo/PhoneDemo";

/* "Wide" from tablets up: there the demo is a desktop browser window, on phones a phone */
const wideQuery = window.matchMedia("(min-width: 768px)");
const subscribe = (onChange) => {
  wideQuery.addEventListener("change", onChange);
  return () => wideQuery.removeEventListener("change", onChange);
};
const isWide = () => wideQuery.matches;

/* The welcome page's how-it-works demo. Only the version on screen runs */
const LoginDemo = () => {
  const wide = useSyncExternalStore(subscribe, isWide);

  return wide ? (
    <DesktopDemo />
  ) : (
    /* The phone and its captions are about 20rem x 41.5rem; shrink them a little and keep only the height needed */
    <div className="flex h-[37.5rem] justify-center">
      <div className="origin-top scale-[0.9]">
        <PhoneDemo />
      </div>
    </div>
  );
};

export default LoginDemo;

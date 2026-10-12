import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { cleanUsername, usernameProblem } from "../auth/usernames";
import AvatarPicker from "./AvatarPicker";
import UserAvatar from "./UserAvatar";

const maxBioLength = 80;

const inputClass =
  "w-full h-11 rounded-xl bg-ink border border-line px-4 text-fg placeholder:text-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/25";

/* Delete my account for good. Typing the username first makes it hard to do by accident */
const DeleteAccount = ({ username }) => {
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const remove = async () => {
    setDeleting(true);
    setError("");
    try {
      await deleteAccount();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Couldn't delete your account. Try again.");
      setDeleting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 text-xs font-medium text-muted hover:text-disagree"
      >
        Delete account
      </button>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-disagree/10 p-4 ring-1 ring-disagree/25">
      <p className="text-sm text-fg">
        This permanently deletes your account, reviews, watchlist, follows and reactions. It can't be undone.
      </p>
      <label className="flex flex-col gap-1.5 text-xs text-soft">
        Type <span className="font-semibold text-fg">{username}</span> to confirm
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoCapitalize="none"
          className={inputClass}
        />
      </label>
      {error && <p className="text-xs text-disagree">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setTyped("");
          }}
          className="flex-1 rounded-full bg-fg/[0.06] py-2 text-sm font-medium text-fg hover:bg-fg/10"
        >
          Keep my account
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={typed.trim().toLowerCase() !== username || deleting}
          className="flex-1 rounded-full bg-disagree py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
          {deleting ? "Deleting..." : "Delete forever"}
        </button>
      </div>
    </div>
  );
};

/* Change my name, username, bio, location and avatar */
const EditProfileModal = ({ onClose }) => {
  const dialogRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [bio, setBio] = useState(user.bio ?? "");
  const [place, setPlace] = useState(user.location ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dialogRef.current.showModal();
  }, []);

  const newUsername = cleanUsername(username);
  const usernameError = usernameProblem(newUsername);
  const changed =
    name.trim() !== user.name ||
    newUsername !== user.username ||
    avatar !== user.avatar ||
    bio.trim() !== (user.bio ?? "") ||
    place.trim() !== (user.location ?? "");

  const save = async (e) => {
    e.preventDefault();
    if (usernameError) return;

    setSaving(true);
    setError("");
    try {
      const oldUsername = user.username;
      const saved = await updateProfile({
        name,
        username: newUsername,
        avatar,
        bio: bio.trim(),
        location: place.trim(),
      });

      /* My profile page lives at /u/<username>, so follow the new name */
      if (location.pathname === `/u/${oldUsername}` && saved.username !== oldUsername) {
        navigate(`/u/${saved.username}`, { replace: true });
      }
      dialogRef.current.close();
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError(err.message || "Couldn't save your profile. Check your connection and try again.");
      setSaving(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <form
        onSubmit={save}
        className="modal-box max-w-md rounded-3xl bg-panel border border-line text-fg p-6 sm:p-8"
      >
        <div className="flex items-center gap-4">
          <UserAvatar user={{ ...user, name, avatar }} className="w-16" />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted">Edit profile</p>
            <h3 className="font-bold text-lg truncate">{name.trim() || "Your name"}</h3>
            <p className="text-sm text-muted truncate">@{newUsername || "username"}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 mt-6">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Name</span>
            <input
              type="text"
              required
              maxLength={40}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Username
            </span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                @
              </span>
              <input
                type="text"
                required
                maxLength={21}
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={Boolean(usernameError)}
                className={`${inputClass} pl-8`}
              />
            </div>
            {usernameError && newUsername !== user.username && (
              <span className="text-xs text-amber-400">{usernameError}</span>
            )}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Bio</span>
            <input
              type="text"
              maxLength={maxBioLength}
              placeholder="Good films, better conversations."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={inputClass}
            />
            <span className="text-xs text-muted self-end tabular-nums">
              {bio.length} / {maxBioLength}
            </span>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Location
            </span>
            <input
              type="text"
              maxLength={40}
              placeholder="City, Country"
              autoComplete="address-level2"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className={inputClass}
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Avatar
            </span>
            <AvatarPicker value={avatar} onChange={setAvatar} />
          </div>
        </div>

        {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

        <div className="modal-action">
          <button
            type="button"
            className="btn shadow-none rounded-full px-5 border-line-strong bg-transparent text-fg hover:bg-panel-2"
            onClick={() => dialogRef.current.close()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !changed || Boolean(usernameError) || !name.trim()}
            className="btn shadow-none rounded-full px-6 bg-brand hover:bg-brand-hover text-white border-none disabled:bg-panel-2 disabled:text-muted"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <DeleteAccount username={user.username} />
      </form>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default EditProfileModal;

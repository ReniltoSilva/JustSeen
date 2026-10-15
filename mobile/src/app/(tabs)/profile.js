import { useAuth } from "../../auth/AuthContext";
import ProfileView from "../../components/ProfileView";

/* My own profile. Feedback, privacy and log out are in the avatar menu, top right */
export default function Profile() {
  const { user } = useAuth();
  /* For the moment between logging out and leaving the tabs */
  if (!user) return null;
  return <ProfileView person={user} isMe />;
}

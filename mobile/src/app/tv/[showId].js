import { useLocalSearchParams } from "expo-router";
import TitleDetails from "../../components/TitleDetails";

/* A TV show's page: /tv/1399 */
export default function ShowScreen() {
  const { showId } = useLocalSearchParams();
  return <TitleDetails key={showId} mediaType="tv" id={Number(showId)} />;
}

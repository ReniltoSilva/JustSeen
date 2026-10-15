import { useLocalSearchParams } from "expo-router";
import TitleDetails from "../../components/TitleDetails";

/* A movie's page: /movie/438631 */
export default function MovieScreen() {
  const { movieId } = useLocalSearchParams();
  return <TitleDetails key={movieId} mediaType="movie" id={Number(movieId)} />;
}

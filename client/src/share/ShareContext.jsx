import { createContext, useContext, useState } from "react";
import ShareReviewModal from "../components/ShareReviewModal";

const ShareContext = createContext(null);

/* The share window lives here, above every page, so it stays open even when the page
behind it reloads (saving a review refreshes lists, and the card that opened it can vanish) */
export const ShareProvider = ({ children }) => {
  /* { movie, rating, review, author, justSaved } or null when closed */
  const [sharing, setSharing] = useState(null);

  return (
    <ShareContext.Provider value={setSharing}>
      {children}
      {sharing && <ShareReviewModal {...sharing} onClose={() => setSharing(null)} />}
    </ShareContext.Provider>
  );
};

/* Returns openShare({ movie, rating, review, author, justSaved }) */
// eslint-disable-next-line react-refresh/only-export-components
export const useShare = () => useContext(ShareContext);

/* Centered spinner while a page (or the login check) is loading */
const PageLoading = () => (
  <div className="grid place-items-center py-32" role="status" aria-label="Loading">
    <span className="loading loading-spinner loading-md text-brand" />
  </div>
);

export default PageLoading;

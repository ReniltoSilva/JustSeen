/* Title and one-line description at the top of a page */
const PageHeading = ({ title, subtitle, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-fg">{title}</h1>
      {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default PageHeading;

import { useEffect, useState } from "react";

/* Same breakpoints as Tailwind's sm / md / lg / xl */
const columnsFor = (width) => {
  if (width < 640) return 1;
  if (width < 768) return 2;
  if (width < 1024) return 3;
  if (width < 1280) return 4;
  return 5;
};

/* Pinterest style layout: cards stack under each other in columns,
dealt out left to right so newest-first still reads across the page */
const Masonry = ({ items, getKey, renderItem, maxColumns = 5, narrowOnPhone = true }) => {
  const [screenColumns, setScreenColumns] = useState(() => columnsFor(window.innerWidth));

  useEffect(() => {
    const handleResize = () => setScreenColumns(columnsFor(window.innerWidth));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columnCount = Math.min(screenColumns, maxColumns);

  const columns = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => columns[index % columnCount].push(item));

  /* One full-width poster is very tall on a phone, so keep single columns a bit narrower */
  const narrow = narrowOnPhone && columnCount === 1;

  return (
    <div className={`flex items-start gap-4 md:gap-6 ${narrow ? "max-w-[19rem] mx-auto" : ""}`}>
      {columns.map((column, index) => (
        <div key={index} className="flex flex-1 min-w-0 flex-col gap-4 md:gap-6">
          {column.map((item) => (
            <div key={getKey(item)}>{renderItem(item)}</div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Masonry;

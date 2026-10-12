import { animalAvatars, animalValue } from "../avatars";
import { AnimalArt } from "./UserAvatar";

/* Grid of free animal avatars, value is "animal:fox" style */
const AvatarPicker = ({ value, onChange }) => (
  <div className="grid grid-cols-6 gap-2.5" role="radiogroup" aria-label="Choose an avatar">
    {animalAvatars.map((animal) => {
      const selected = value === animalValue(animal);
      return (
        <button
          key={animal.id}
          type="button"
          role="radio"
          aria-checked={selected}
          aria-label={animal.id}
          title={animal.id}
          onClick={() => onChange(animalValue(animal))}
          className={`aspect-square rounded-full overflow-hidden transition ring-offset-2 ring-offset-panel ${
            selected ? "ring-2 ring-brand scale-105" : "opacity-80 hover:opacity-100 hover:scale-105"
          }`}
        >
          <AnimalArt animal={animal} />
        </button>
      );
    })}
  </div>
);

export default AvatarPicker;

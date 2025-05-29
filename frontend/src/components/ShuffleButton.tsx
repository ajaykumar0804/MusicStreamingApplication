import { FaRandom } from "react-icons/fa";
import { usePlayerStore } from "@/stores/usePlayerStore";

export const ShuffleButton = () => {
  const { isShuffle, toggleShuffle } = usePlayerStore();

  return (
    <button onClick={toggleShuffle}>
      <FaRandom
        className={`h-5 w-5 transition-colors ${
          isShuffle ? "text-green-500" : "text-white"
        }`}
      />
    </button>
  );
};

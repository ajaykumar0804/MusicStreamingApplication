import { Repeat, Repeat1, Repeat2 } from "lucide-react";
import { usePlayerStore } from "@/stores/usePlayerStore";

export const RepeatButton = () => {
    const { repeatMode, repeatCount, setRepeatMode } = usePlayerStore();

  const getIcon = () => {
    switch (repeatMode) {
      case "one":
        return <Repeat1 />;
      case "all":
        return <Repeat />;
      case "count":
        return <span className="text-xs font-bold"><Repeat2></Repeat2></span>;
      default:
        return <Repeat />;
    }
  };

  const cycleRepeatMode = () => {
    switch (repeatMode) {
      case "none":
        setRepeatMode("one");
        break;
      case "one":
        setRepeatMode("count", 2);
        break;
      case "count":
        setRepeatMode("all");
        break;
      case "all":
      default:
        setRepeatMode("none");
        break;
    }
  };

  const isActive = repeatMode !== "none";

  return (
    <button onClick={cycleRepeatMode}>
      <span
        className={`h-5 w-5 transition-colors ${
          isActive ? "text-green-500" : "text-white"
        }`}
      >
        {getIcon()}
      </span>
    </button>
  );
};

import AppPreviewContainer from "@/components/app-preview-container";
import { DotPattern } from "@/components/ui/dot-pattern";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-neutral-950 overflow-hidden">
      <DotPattern className="text-neutral-700/50" width={24} height={24} cr={1.5} glow />
      <div className="relative z-10">
        <AppPreviewContainer />
      </div>
    </div>
  );
}

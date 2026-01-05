import AppPreviewContainer from "@/components/app-preview-container";
import { DotPattern } from "@/components/ui/dot-pattern";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-stone-100 overflow-hidden">
      <DotPattern width={32} height={32} glow />
      <div className="relative z-10">
        <AppPreviewContainer />
      </div>
    </div>
  );
}

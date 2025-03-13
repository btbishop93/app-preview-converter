import AppPreviewContainer from "@/components/app-preview-container";
import { WarpBackground } from "@/components/magicui/warp-background";

export default function Home() {
  return (
    <WarpBackground className="min-h-screen">
      <div className="overflow-hidden">
        <AppPreviewContainer />
      </div>
    </WarpBackground>
  );
}

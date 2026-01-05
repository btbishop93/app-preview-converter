# 🍎 Ciderpress

Press your app preview videos into App Store perfection.

**Why this exists:** When uploading MP4 app recordings to Apple's App Store Connect, uploads often fail silently without any indication why. Apple secretly checks for specific video formatting requirements. Ciderpress applies those formats to your video so it can be properly uploaded.

## Features

- Convert videos to macOS App Store format (1920×1080)
- Convert videos to iOS App Store format (886×1920)
- Add silent audio track (fixes common Apple upload rejections)
- **100% client-side processing** - your video never leaves your browser
- Desktop-only (video processing requires desktop browser)

## Requirements

### System Requirements

- **Node.js** 18.x or higher (for development/hosting)
- **Modern browser** with SharedArrayBuffer support (Chrome, Firefox, Edge)

### Video Requirements

- Format: MP4
- Duration: 15-30 seconds (App Store limit)

## How It Works

Ciderpress uses [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) to process videos entirely in your browser using WebAssembly. No server-side processing required.

The first time you convert a video, the app downloads the FFmpeg WASM core (~31MB). This is cached by your browser for future use.

## Development

```bash
# Install dependencies
bun install

# Start the development server
bun dev

# Run tests
bun test

# Run tests with coverage
bun test:coverage

# Lint & format check
bun run check

# Build for production
bun run build
```

## Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Magic UI
- **Animation:** Motion (Framer Motion)
- **Linting:** Biome
- **Testing:** Vitest + React Testing Library
- **Video Processing:** ffmpeg.wasm (client-side WebAssembly)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   └── page.tsx            # Main page
├── components/
│   ├── providers/          # React context providers
│   ├── ui/                 # UI components (shadcn + custom)
│   └── video-convert/      # Video conversion flow
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── types/                  # TypeScript types
└── __tests__/              # Test files
```

## Deployment

Deploy to any static hosting or Node.js platform:

- Vercel (recommended)
- Netlify
- Cloudflare Pages
- Any static host

No special server configuration required since all video processing happens client-side.

### Required Headers

The app requires these security headers for SharedArrayBuffer support (already configured in `next.config.mjs`):

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

## License

MIT

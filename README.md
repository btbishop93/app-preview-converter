# 🍎 Ciderpress

Press your app preview videos into App Store perfection.

**Why this exists:** When uploading MP4 app recordings to Apple's App Store Connect, uploads often fail silently without any indication why. Apple secretly checks for specific video formatting requirements. Ciderpress applies those formats to your video so it can be properly uploaded.

## Features

- Convert videos to macOS App Store format (1920×1080)
- Convert videos to iOS App Store format (886×1920)
- Add silent audio track (fixes common Apple upload rejections)
- Fast server-side processing with FFmpeg
- Desktop-only (video processing requires desktop browser)

## Requirements

### System Requirements

- **Node.js** 18.x or higher
- **FFmpeg** installed on the server (required for video processing)

### Video Requirements

- Format: MP4
- Duration: 15-30 seconds
- Max file size: 500MB

## Server Requirements

This application requires FFmpeg to be installed on the server.

### macOS

```bash
brew install ffmpeg
ffmpeg -version
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install -y ffmpeg
ffmpeg -version
```

### CentOS/RHEL/Fedora

```bash
sudo dnf install -y ffmpeg ffmpeg-devel
ffmpeg -version
```

### Windows

1. Download FFmpeg from [ffmpeg.org/download.html](https://www.ffmpeg.org/download.html)
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to system PATH
4. Verify: `ffmpeg -version`

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
- **Video Processing:** FFmpeg (server-side)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/convert/        # Video conversion API endpoint
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

Deploy to any Node.js platform that supports Next.js:

- Vercel
- Railway
- Render
- DigitalOcean App Platform
- AWS (EC2, ECS, Lambda)

**Important:** Ensure FFmpeg is installed on your deployment server. The app will return a 503 error if FFmpeg is not available.

### Environment Variables

No environment variables are required for basic operation. For production, consider:

```env
NODE_ENV=production
```

## License

MIT

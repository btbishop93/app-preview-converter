# App Preview Converter

Convert your videos to the required format for macOS and iOS App Store app previews.

## Features

- Convert videos to macOS App Store format (1920×1080)
- Convert videos to iOS App Store format (886×1920)
- Add silent audio track (fixes Apple upload issues)
- Fast server-side processing with native FFmpeg
- Progress tracking for upload and download
- Instant preview of converted videos

## Server Requirements

This application requires FFmpeg to be installed on the server. For optimal performance, follow these installation instructions:

### macOS

```bash
# Using Homebrew
brew install ffmpeg

# Verify installation
ffmpeg -version
```

### Ubuntu/Debian

```bash
# Update package lists
sudo apt update

# Install FFmpeg
sudo apt install -y ffmpeg

# Verify installation
ffmpeg -version
```

### CentOS/RHEL/Fedora

```bash
# For CentOS/RHEL 8 or newer and Fedora
sudo dnf install -y ffmpeg ffmpeg-devel

# Verify installation
ffmpeg -version
```

### Windows Server

1. Download FFmpeg from the [official website](https://www.ffmpeg.org/download.html)
2. Extract the files to a folder, e.g., `C:\ffmpeg`
3. Add the `bin` folder to your system PATH
4. Verify by running `ffmpeg -version` in the command prompt

## Development

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

## Building for Production

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

## Deployment

This application can be deployed to any Node.js hosting platforms that support Next.js, such as:

- Vercel
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Heroku

**Important:** Ensure that FFmpeg is installed on your deployment server for the video conversion to work properly.

## License

MIT

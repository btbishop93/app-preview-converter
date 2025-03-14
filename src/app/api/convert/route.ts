import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import util from 'util';

// Convert exec to Promise
const execAsync = util.promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // Check if formData is available
    if (!request.formData) {
      return NextResponse.json({ error: 'FormData not supported' }, { status: 400 });
    }

    // Get form data with the video file
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const platform = formData.get('platform') as string || 'macOS';
    const addSilentAudio = formData.get('addSilentAudio') === 'true';
    
    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Create temporary file paths
    const tempDir = os.tmpdir();
    const uniqueId = uuidv4();
    const inputPath = path.join(tempDir, `input-${uniqueId}.mp4`);
    const outputPath = path.join(tempDir, `output-${uniqueId}.mp4`);
    
    try {
      // Save the uploaded file to disk
      const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
      await fs.writeFile(inputPath, videoBuffer);
      console.log(`Input file saved to ${inputPath}`);
      
      // Check input file dimensions
      try {
        const { stdout } = await execAsync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=s=x:p=0 ${inputPath}`);
        console.log(`Input file info: ${stdout.trim()}`);
      } catch (e) {
        console.error('Error checking input dimensions:', e);
      }
      
      // Apply original scaling commands only
      let ffmpegCommand = '';
      
      if (platform === 'macOS') {
        // Original command for macOS - exactly as provided
        ffmpegCommand = `ffmpeg -y -i ${inputPath} -vf "scale=1920:1080:flags=lanczos,setsar=1"`;
        console.log(`Using macOS command: ${ffmpegCommand}`);
      } else {
        // Original command for iOS - exactly as provided
        ffmpegCommand = `ffmpeg -y -i ${inputPath} -vf "scale=886:1920:flags=lanczos,setsar=1"`;
        console.log(`Using iOS command: ${ffmpegCommand}`);
      }
      
      // Add silent audio if requested
      if (addSilentAudio) {
        const tempOutputPath = path.join(tempDir, `temp-${uniqueId}.mp4`);
        
        try {
          // First convert video - add output path to command
          console.log(`Executing command: ${ffmpegCommand} -an ${tempOutputPath}`);
          const { stdout, stderr } = await execAsync(`${ffmpegCommand} -an ${tempOutputPath}`);
          console.log('FFmpeg stdout:', stdout);
          console.log('FFmpeg stderr:', stderr);
          
          // Then add silent audio with a modified command that might be more compatible with Apple
          console.log(`Executing command: ffmpeg -y -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 -i ${tempOutputPath} -c:v copy -c:a aac -b:a 128k -shortest ${outputPath}`);
          const audioResult = await execAsync(`ffmpeg -y -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 -i ${tempOutputPath} -c:v copy -c:a aac -b:a 128k -shortest ${outputPath}`);
          console.log('Audio FFmpeg stdout:', audioResult.stdout);
          console.log('Audio FFmpeg stderr:', audioResult.stderr);
        } finally {
          // Clean up temp file even if there's an error
          try {
            await fs.unlink(tempOutputPath).catch(() => {});
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      } else {
        // Just convert video - add output path to command
        console.log(`Executing command: ${ffmpegCommand} ${outputPath}`);
        const { stdout, stderr } = await execAsync(`${ffmpegCommand} ${outputPath}`);
        console.log('FFmpeg stdout:', stdout);
        console.log('FFmpeg stderr:', stderr);
      }

      // Convert final output to 30fps
      const finalTempPath = path.join(tempDir, `final-${uniqueId}.mp4`);
      try {
        console.log(`Executing command: ffmpeg -y -i ${outputPath} -r 30 ${finalTempPath}`);
        const fpsResult = await execAsync(`ffmpeg -y -i ${outputPath} -r 30 ${finalTempPath}`);
        console.log('FPS FFmpeg stdout:', fpsResult.stdout);
        console.log('FPS FFmpeg stderr:', fpsResult.stderr);

        // Move the final temp file to output
        await fs.rename(finalTempPath, outputPath);
      } finally {
        // Clean up final temp file if it exists
        try {
          await fs.access(finalTempPath).then(() => 
            fs.unlink(finalTempPath).catch(() => {})
          ).catch(() => {});
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      // Read the output file
      const outputBuffer = await fs.readFile(outputPath);
      
      // Check the output file dimensions
      try {
        const { stdout } = await execAsync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${outputPath}`);
        console.log(`Output file dimensions: ${stdout.trim()}`);
      } catch (e) {
        console.error('Error checking output dimensions:', e);
      }
      
      // Check the audio properties if silent audio was added
      if (addSilentAudio) {
        try {
          const { stdout } = await execAsync(`ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,bit_rate -of default=noprint_wrappers=1 ${outputPath}`);
          console.log(`Output audio properties: ${stdout.trim()}`);
        } catch (e) {
          console.error('Error checking audio properties:', e);
        }
      }
      
      // Return the converted video
      return new NextResponse(outputBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="${platform}_Preview${addSilentAudio ? '_with_silent_audio' : ''}.mp4"`,
        },
      });
    } finally {
      // Clean up regardless of success or failure
      try {
        // Delete input file if it exists
        await fs.access(inputPath).then(() => 
          fs.unlink(inputPath).catch(() => {})
        ).catch(() => {});
        
        // Delete output file if it exists
        await fs.access(outputPath).then(() => 
          fs.unlink(outputPath).catch(() => {})
        ).catch(() => {});
      } catch (e) {
        // Ignore cleanup errors
        console.log('Error during cleanup:', e);
      }
    }
  } catch (error) {
    console.error('Error during conversion:', error);
    return NextResponse.json(
      { error: 'An error occurred during conversion' },
      { status: 500 }
    );
  }
} 
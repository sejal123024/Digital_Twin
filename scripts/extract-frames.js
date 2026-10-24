import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const videoPath = path.resolve('Video Project 9 (1).mp4');
const outputDir = path.resolve('public/frames');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Extracting frames using ffmpeg:', ffmpegPath);
console.log('Video path:', videoPath);
console.log('Output dir:', outputDir);

try {
  // Clear old frames
  const oldFiles = fs.readdirSync(outputDir);
  for (const file of oldFiles) {
    fs.unlinkSync(path.join(outputDir, file));
  }

  // Extract every frame (1:1 original 30fps frames) scaled to 1280x720 with high JPEG quality (q:v 2)
  const command = `"${ffmpegPath}" -i "${videoPath}" -vf "scale=1280:-2" -q:v 2 "${path.join(outputDir, 'frame_%04d.jpg')}"`;
  console.log('Running:', command);
  execSync(command, { stdio: 'inherit' });

  const generatedFrames = fs.readdirSync(outputDir)
    .filter(f => f.endsWith('.jpg'))
    .sort();

  console.log(`Successfully extracted ${generatedFrames.length} frames!`);

  const manifest = {
    totalFrames: generatedFrames.length,
    frames: generatedFrames.map(f => `/frames/${f}`)
  };

  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Manifest written to public/frames/manifest.json');
} catch (err) {
  console.error('Error during frame extraction:', err);
  process.exit(1);
}

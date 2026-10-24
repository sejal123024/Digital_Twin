import cv2
import os
import json

video_path = os.path.abspath("Video Project 9 (1).mp4")
output_dir = os.path.abspath("public/frames")
os.makedirs(output_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)

print(f"Video loaded: {total_video_frames} total frames, FPS: {fps}")

# We want around 150 frames
target_frame_count = 150
step = max(1, total_video_frames // target_frame_count)

frame_paths = []
current_frame_idx = 0
saved_count = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    if current_frame_idx % step == 0 and saved_count < target_frame_count:
        saved_count += 1
        # Resize to 1280 width preserving aspect ratio
        h, w = frame.shape[:2]
        new_w = 1280
        new_h = int(h * (new_w / w))
        resized = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)
        
        filename = f"frame_{saved_count:04d}.jpg"
        filepath = os.path.join(output_dir, filename)
        cv2.imwrite(filepath, resized, [cv2.IMWRITE_JPEG_QUALITY, 85])
        frame_paths.append(f"/frames/{filename}")
    
    current_frame_idx += 1

cap.release()

manifest = {
    "totalFrames": len(frame_paths),
    "frames": frame_paths
}

with open(os.path.join(output_dir, "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=2)

print(f"Extraction complete! Saved {len(frame_paths)} frames to {output_dir}")

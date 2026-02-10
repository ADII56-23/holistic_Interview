
import os
import sys

print("1. Testing Imports...")
try:
    import imageio_ffmpeg
    print(f"   [OK] imageio_ffmpeg imported. Path: {imageio_ffmpeg.get_ffmpeg_exe()}")
except ImportError as e:
    print(f"   [FAIL] imageio_ffmpeg import failed: {e}")

try:
    from moviepy import VideoFileClip
    print("   [OK] moviepy.VideoFileClip imported")
except ImportError as e:
    print(f"   [FAIL] moviepy import failed: {e}")

try:
    import whisper
    print("   [OK] whisper imported")
except ImportError as e:
    print(f"   [FAIL] whisper import failed: {e}")

print("\n2. Testing Path Injection...")
try:
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    ffmpeg_dir = os.path.dirname(ffmpeg_exe)
    os.environ["PATH"] += os.pathsep + ffmpeg_dir
    print(f"   [OK] Added to PATH: {ffmpeg_dir}")
except Exception as e:
    print(f"   [FAIL] Path injection failed: {e}")

print("\n3. Testing FFmpeg Execution...")
import subprocess
try:
    result = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
    if result.returncode == 0:
        print("   [OK] ffmpeg command works!")
        print(f"   Version: {result.stdout.splitlines()[0]}")
    else:
        print(f"   [FAIL] ffmpeg returned non-zero exit code: {result.stderr}")
except FileNotFoundError:
    print("   [FAIL] 'ffmpeg' command not found in PATH (subprocess check failed)")
except Exception as e:
    print(f"   [FAIL] subprocess check error: {e}")

# Camera and Microphone Troubleshooting Guide

## Common Issues and Solutions

### 1. "No camera or microphone found" Error

**Possible Causes:**
- No physical camera/microphone connected to your computer
- Camera/microphone is disabled in Device Manager (Windows)
- USB connection issues

**Solutions:**
1. **Check Physical Connection:**
   - Ensure your webcam is properly plugged into a USB port
   - Try a different USB port
   - If using a laptop, check if there's a physical camera privacy switch

2. **Check Device Manager (Windows):**
   - Press `Win + X` and select "Device Manager"
   - Look for "Cameras" and "Audio inputs and outputs"
   - If you see a yellow warning icon, right-click and select "Update driver"
   - If disabled, right-click and select "Enable device"

3. **Check System Settings:**
   - Go to Settings > Privacy > Camera
   - Ensure "Allow apps to access your camera" is ON
   - Go to Settings > Privacy > Microphone
   - Ensure "Allow apps to access your microphone" is ON

### 2. "Permission Denied" Error

**Solutions:**
1. **Browser Permissions:**
   - Click the camera icon in the address bar (Chrome/Edge)
   - Select "Always allow" for camera and microphone
   - Refresh the page

2. **Reset Browser Permissions:**
   - Chrome: Settings > Privacy and security > Site Settings > Camera/Microphone
   - Find your site and change permission to "Allow"

### 3. "Camera is already in use" Error

**Possible Causes:**
- Another application is using the camera (Zoom, Teams, Skype, etc.)
- Multiple browser tabs trying to access the camera

**Solutions:**
1. Close all other applications that might use the camera:
   - Video conferencing apps (Zoom, Teams, Skype, Google Meet)
   - Other browser tabs with video calls
   - Camera apps
   - Discord, Slack with video enabled

2. Restart your browser completely

3. If the issue persists, restart your computer

### 4. Browser-Specific Issues

**Supported Browsers:**
- ✅ Google Chrome (recommended)
- ✅ Microsoft Edge
- ✅ Firefox
- ❌ Internet Explorer (not supported)
- ⚠️ Safari (may have limitations)

**If using Chrome/Edge:**
1. Make sure you're using HTTPS or localhost
2. Check chrome://settings/content/camera
3. Check chrome://settings/content/microphone

### 5. Testing Your Devices

**Quick Test:**
1. Open a new tab and go to: https://webcamtests.com/
2. Click "Test my cam" to verify your camera works
3. Click "Test my mic" to verify your microphone works

**Windows Camera App:**
1. Press `Win + S` and search for "Camera"
2. Open the Camera app
3. If the camera works here, the issue is likely browser permissions

## Debugging Steps

1. **Open Browser Console:**
   - Press `F12` or `Ctrl + Shift + I`
   - Go to the "Console" tab
   - Look for error messages when trying to access camera

2. **Check Available Devices:**
   - The app now logs available devices in the console
   - Look for "Available devices:" message
   - It will show if video/audio devices are detected

3. **Common Error Messages:**
   - `NotFoundError`: No camera/mic found → Check physical connection
   - `NotAllowedError`: Permission denied → Allow in browser settings
   - `NotReadableError`: Device busy → Close other apps
   - `OverconstrainedError`: Requested settings not supported → App will retry with basic settings

## Still Having Issues?

1. **Update Drivers:**
   - Go to your computer manufacturer's website
   - Download latest camera and audio drivers

2. **Try a Different Browser:**
   - Download Google Chrome if not already installed
   - Test the application there

3. **Check Antivirus/Firewall:**
   - Some security software blocks camera access
   - Temporarily disable and test

4. **Hardware Test:**
   - Try your camera/mic on a different computer
   - This confirms if it's a hardware issue

## For Developers

The application now includes:
- ✅ Device enumeration before requesting access
- ✅ Fallback to basic constraints if ideal settings fail
- ✅ Specific error messages for different failure types
- ✅ Detailed console logging for debugging
- ✅ Retry logic for temporary failures

**Console Logs to Check:**
```
"Initializing camera..."
"Available devices:" { video: true/false, audio: true/false }
"Stream successfully obtained:" [stream-id]
```

**Error Handling:**
- NotFoundError → Device not connected
- NotAllowedError → Permission denied
- NotReadableError → Device in use
- All errors now show user-friendly messages

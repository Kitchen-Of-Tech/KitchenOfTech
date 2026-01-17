# 3D Model Setup Instructions

## Download the Laptop Model

1. **Visit Sketchfab**: Go to https://skfb.ly/pEDJY
2. **Download Model**: Click the "Download 3D Model" button (you may need to create a free account)
3. **Select Format**: Choose **glTF (.gltf/.glb)** format
4. **Save File**: Save the downloaded file as `laptop.glb`
5. **Place File**: Move `laptop.glb` to this directory: `public/models/laptop.glb`

## Alternative: Direct Download Steps

If you can't download from Sketchfab directly:

1. Go to: https://sketchfab.com/3d-models/laptop-pEDJY
2. Click "Download 3D Model"
3. Select "Auto-converted format (glTF)"
4. Extract the downloaded ZIP file
5. Find the `.glb` file inside
6. Rename it to `laptop.glb`
7. Place it in `public/models/laptop.glb`

## File Structure

After downloading, your file structure should look like:
```
public/
  models/
    laptop.glb          <- Place downloaded model here
    README.md           <- This file
```

## Fallback

If the model file is not found, the application will display a simplified laptop placeholder until you add the real model.

from PIL import Image
import os

uploaded_img_path = r"C:\Users\pit2\.gemini\antigravity\brain\cc683e7c-75b2-4ba0-b409-a4d587d38a34\.user_uploaded\media_1787169338119.jpg"

if os.path.exists(uploaded_img_path):
    img = Image.open(uploaded_img_path)
    # Convert to RGBA and resize to high quality 256x256
    img = img.convert("RGBA")
    img_resized = img.resize((256, 256), Image.Resampling.LANCZOS)

    paths = [
        r"C:\Users\pit2\Desktop\spritehack\fabric-mod\src\main\resources\assets\spritehack\icon.png",
        r"C:\Users\pit2\Desktop\spritehack\icon.png",
        r"C:\Users\pit2\AppData\Roaming\gdlauncher_carbon\data\instances\fabric 1.20.4\icon.png",
        r"C:\Users\pit2\AppData\Roaming\gdlauncher_carbon\data\instances\fabric 1.20.4\instance\icon.png",
        r"C:\Users\pit2\AppData\Roaming\gdlauncher_carbon\data\instances\fabric 26.2\icon.png",
        r"C:\Users\pit2\AppData\Roaming\gdlauncher_carbon\data\instances\fabric 26.2\instance\icon.png"
    ]

    for p in paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        img_resized.save(p)
        print("Saved thumbnail to:", p)

    print("[SUCCESS] Uploaded SpriteHack logo set as thumbnail icon for both GDLauncher instances!")
else:
    print("[ERROR] Uploaded image not found at:", uploaded_img_path)

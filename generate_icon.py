from PIL import Image, ImageDraw, ImageFont
import os

# Create 128x128 High-Resolution SpriteHack Thumbnail Icon
img = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Dark Purple Obsidian Rounded Background
# Dark purple: #170F28, Border: #7C3AED
bg_color = (23, 15, 40, 250)
border_color = (124, 58, 237, 255)

# Rounded rectangle background
draw.rounded_rectangle([4, 4, 124, 124], radius=24, fill=bg_color, outline=border_color, width=4)

# Inner Glow / Accent Lines
glow_color = (168, 85, 247, 180)
draw.rounded_rectangle([8, 8, 120, 120], radius=20, fill=None, outline=glow_color, width=2)

# Central Sprite Lightning Bolt Symbol / 'S' (Royal Deep Purple / Neon Glow)
# Lightning bolt polygon points
points = [
    (68, 20),
    (38, 64),
    (60, 64),
    (52, 108),
    (90, 56),
    (66, 56)
]

draw.polygon(points, fill=(124, 58, 237, 255), outline=(255, 255, 255, 255))

# Save icon PNGs
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
    img.save(p)
    print("Saved icon to:", p)

print("[OK] SpriteHack 128x128 Thumbnail Icons generated successfully!")

import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_zen_icon(size=1024):
    """
    Generate master Zen Chrono Ring icon at high resolution (1024x1024)
    Optimized with bold, high-contrast geometry that remains punchy and legible
    even when downsampled to 16x16 and 32x32 on Chrome toolbar.
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    
    # 1. Gradient Rounded Rectangle (Continuous Squircle)
    corner_radius = int(size * 0.226) # ~230px at 1024
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, size, size], radius=corner_radius, fill=255)
    
    # Background gradient: Rich Obsidian #1C1C22 -> #0B0B0E
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    for y in range(size):
        ratio = y / size
        r = int(28 * (1 - ratio) + 11 * ratio)
        g = int(28 * (1 - ratio) + 11 * ratio)
        b = int(34 * (1 - ratio) + 14 * ratio)
        line = Image.new("RGBA", (size, 1), (r, g, b, 255))
        bg.paste(line, (0, y))
    
    img.paste(bg, (0, 0), mask)
    
    draw = ImageDraw.Draw(img)
    # Crisp specular perimeter border (so squircle stands out on dark & light toolbars)
    border_width = max(2, int(size * 0.012))
    draw.rounded_rectangle(
        [border_width, border_width, size - border_width, size - border_width],
        radius=corner_radius,
        outline=(255, 255, 255, 45),
        width=border_width
    )
    
    cx, cy = size / 2, size / 2
    r_orbit = size * 0.285 # ~292px orbit radius
    
    # 2. Emerald Focus Aura Glow Layer
    glow_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    glow_r = int(r_orbit * 1.35)
    glow_draw.ellipse([cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r], fill=(48, 209, 88, 55))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(int(size * 0.07)))
    img.alpha_composite(glow_layer)
    
    draw = ImageDraw.Draw(img)
    
    # 3. Inactive Orbit Track
    track_width = int(size * 0.048) # ~49px
    draw.ellipse(
        [cx - r_orbit, cy - r_orbit, cx + r_orbit, cy + r_orbit],
        outline=(255, 255, 255, 28),
        width=track_width
    )
    
    # 4. Active 270° Focus Arc (Enso Ring from 12 o'clock / 270° to 9 o'clock / 180°)
    arc_width = int(size * 0.068) # ~70px punchy stroke
    
    # Ambient shadow for arc
    arc_shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    arc_s_draw = ImageDraw.Draw(arc_shadow)
    arc_s_draw.arc(
        [cx - r_orbit, cy - r_orbit, cx + r_orbit, cy + r_orbit],
        start=270, end=180,
        fill=(0, 0, 0, 140),
        width=arc_width
    )
    start_x = cx + r_orbit * math.cos(math.radians(270))
    start_y = cy + r_orbit * math.sin(math.radians(270))
    end_x = cx + r_orbit * math.cos(math.radians(180))
    end_y = cy + r_orbit * math.sin(math.radians(180))
    cap_r = arc_width / 2
    arc_s_draw.ellipse([start_x - cap_r, start_y - cap_r, start_x + cap_r, start_y + cap_r], fill=(0, 0, 0, 140))
    arc_s_draw.ellipse([end_x - cap_r, end_y - cap_r, end_x + cap_r, end_y + cap_r], fill=(0, 0, 0, 140))
    arc_shadow = arc_shadow.filter(ImageFilter.GaussianBlur(int(size * 0.02)))
    img.paste(arc_shadow, (0, int(size * 0.012)), arc_shadow)
    
    # Draw primary white focus arc
    draw.arc(
        [cx - r_orbit, cy - r_orbit, cx + r_orbit, cy + r_orbit],
        start=270, end=180,
        fill=(255, 255, 255, 255),
        width=arc_width
    )
    draw.ellipse([start_x - cap_r, start_y - cap_r, start_x + cap_r, start_y + cap_r], fill=(255, 255, 255, 255))
    draw.ellipse([end_x - cap_r, end_y - cap_r, end_x + cap_r, end_y + cap_r], fill=(235, 238, 242, 255))
    
    # 5. Baton Clock Hands
    hand_width = int(size * 0.044) # ~45px
    # Vertical Hand (12 o'clock / 60m focus)
    h_top_y = cy - (size * 0.210)
    draw.line([(cx, cy), (cx, h_top_y)], fill=(255, 255, 255, 255), width=hand_width)
    draw.ellipse([cx - hand_width/2, h_top_y - hand_width/2, cx + hand_width/2, h_top_y + hand_width/2], fill=(255, 255, 255, 255))
    
    # Horizontal Hand (3 o'clock / 15m focus)
    h_right_x = cx + (size * 0.165)
    draw.line([(cx, cy), (h_right_x, cy)], fill=(255, 255, 255, 255), width=hand_width)
    draw.ellipse([h_right_x - hand_width/2, cy - hand_width/2, h_right_x + hand_width/2, cy + hand_width/2], fill=(255, 255, 255, 255))
    
    # 6. Central Emerald Zen Focus Pivot
    pivot_r = size * 0.036
    draw.ellipse([cx - pivot_r, cy - pivot_r, cx + pivot_r, cy + pivot_r], fill=(48, 209, 88, 255)) # #30D158
    inner_pin_r = size * 0.013
    draw.ellipse([cx - inner_pin_r, cy - inner_pin_r, cx + inner_pin_r, cy + inner_pin_r], fill=(255, 255, 255, 255))
    
    return img

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    print("Generating Master 1024x1024 Zen Chrono Ring...")
    master = create_zen_icon(1024)
    
    sizes = [128, 48, 32, 24, 16]
    dirs = [
        os.path.join(project_root, "icons"),
        os.path.join(project_root, "docs", "icons")
    ]
    
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        for s in sizes:
            resized = master.resize((s, s), Image.Resampling.LANCZOS)
            out_path = os.path.join(d, f"icon{s}.png")
            resized.save(out_path, format="PNG", optimize=True)
            print(f"Saved {out_path} ({s}x{s})")
            
    print("\nAll icons successfully generated across 16px, 24px, 32px, 48px, 128px!")

import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def create_zen_icon(size=1024):
    # Supersampled high-resolution canvas
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    
    # 1. Gradient Rounded Rectangle (Squircle)
    # Create mask for rounded rectangle
    corner_radius = int(size * 0.226) # 116 / 512 ≈ 0.226
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, size, size], radius=corner_radius, fill=255)
    
    # Background gradient #18181C to #09090B
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    for y in range(size):
        ratio = y / size
        # Linear interp between #18181C (24, 24, 28) and #09090B (9, 9, 11)
        r = int(24 * (1 - ratio) + 9 * ratio)
        g = int(24 * (1 - ratio) + 9 * ratio)
        b = int(28 * (1 - ratio) + 11 * ratio)
        line = Image.new("RGBA", (size, 1), (r, g, b, 255))
        bg.paste(line, (0, y))
    
    img.paste(bg, (0, 0), mask)
    
    draw = ImageDraw.Draw(img)
    # Subtle inner border
    border_width = max(2, int(size * 0.006))
    draw.rounded_rectangle(
        [border_width, border_width, size - border_width, size - border_width],
        radius=corner_radius,
        outline=(255, 255, 255, 25),
        width=border_width
    )
    
    cx, cy = size / 2, size / 2
    r_orbit = size * 0.273 # 140 / 512
    
    # 2. Subtle Emerald Glow Layer
    glow_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    glow_r = int(r_orbit * 1.3)
    glow_draw.ellipse([cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r], fill=(48, 209, 88, 45))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(int(size * 0.08)))
    img.alpha_composite(glow_layer)
    
    draw = ImageDraw.Draw(img)
    
    # 3. Inactive Orbit Track
    track_width = int(size * 0.043) # 22 / 512
    draw.ellipse(
        [cx - r_orbit, cy - r_orbit, cx + r_orbit, cy + r_orbit],
        outline=(255, 255, 255, 22),
        width=track_width
    )
    
    # 4. Active 270° Focus Arc (Mindful Enso Flow from 12 o'clock / -90° clockwise to 9 o'clock / 180°)
    arc_width = int(size * 0.052) # 26 / 512
    # Shadow for arc
    arc_shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    arc_s_draw = ImageDraw.Draw(arc_shadow)
    arc_s_draw.arc(
        [cx - r_orbit, cy - r_orbit, cx + r_orbit, cy + r_orbit],
        start=270, end=180,
        fill=(0, 0, 0, 120),
        width=arc_width
    )
    # Caps for shadow
    start_x = cx + r_orbit * math.cos(math.radians(270))
    start_y = cy + r_orbit * math.sin(math.radians(270))
    end_x = cx + r_orbit * math.cos(math.radians(180))
    end_y = cy + r_orbit * math.sin(math.radians(180))
    cap_r = arc_width / 2
    arc_s_draw.ellipse([start_x - cap_r, start_y - cap_r, start_x + cap_r, start_y + cap_r], fill=(0, 0, 0, 120))
    arc_s_draw.ellipse([end_x - cap_r, end_y - cap_r, end_x + cap_r, end_y + cap_r], fill=(0, 0, 0, 120))
    arc_shadow = arc_shadow.filter(ImageFilter.GaussianBlur(int(size * 0.02)))
    # Offset shadow slightly down
    img.paste(arc_shadow, (0, int(size * 0.015)), arc_shadow)
    
    # Draw actual arc
    draw.arc(
        [cx - r_orbit, cy - r_orbit, cx + r_orbit, cy + r_orbit],
        start=270, end=180,
        fill=(248, 250, 252, 255),
        width=arc_width
    )
    draw.ellipse([start_x - cap_r, start_y - cap_r, start_x + cap_r, start_y + cap_r], fill=(255, 255, 255, 255))
    draw.ellipse([end_x - cap_r, end_y - cap_r, end_x + cap_r, end_y + cap_r], fill=(228, 231, 236, 255))
    
    # 5. Baton Clock Hands
    hand_width = int(size * 0.032) # 16 / 512
    # Vertical Hand (12 o'clock)
    h_top_y = cy - (size * 0.203) # 104px reach
    draw.line([(cx, cy), (cx, h_top_y)], fill=(255, 255, 255, 255), width=hand_width)
    draw.ellipse([cx - hand_width/2, h_top_y - hand_width/2, cx + hand_width/2, h_top_y + hand_width/2], fill=(255, 255, 255, 255))
    
    # Horizontal Hand (3 o'clock / 15m reach)
    h_right_x = cx + (size * 0.152) # 78px reach
    draw.line([(cx, cy), (h_right_x, cy)], fill=(255, 255, 255, 255), width=hand_width)
    draw.ellipse([h_right_x - hand_width/2, cy - hand_width/2, h_right_x + hand_width/2, cy + hand_width/2], fill=(255, 255, 255, 255))
    
    # 6. Central Emerald Zen Focus Pivot
    pivot_r = size * 0.028 # 14 / 512
    draw.ellipse([cx - pivot_r, cy - pivot_r, cx + pivot_r, cy + pivot_r], fill=(48, 209, 88, 255)) # #30D158
    inner_pin_r = size * 0.010 # 5 / 512
    draw.ellipse([cx - inner_pin_r, cy - inner_pin_r, cx + inner_pin_r, cy + inner_pin_r], fill=(255, 255, 255, 255))
    
    return img

if __name__ == "__main__":
    print("Generating Master 1024x1024 Zen Chrono Ring...")
    master = create_zen_icon(1024)
    
    sizes = [128, 48, 16]
    dirs = [
        "web-timer-extension/icons",
        "web-timer-extension/docs/icons"
    ]
    
    for d in dirs:
        for s in sizes:
            resized = master.resize((s, s), Image.Resampling.LANCZOS)
            out_path = f"{d}/icon{s}.png"
            resized.save(out_path, format="PNG", optimize=True)
            print(f"Saved {out_path} ({s}x{s})")
            
    print("All icons successfully generated!")

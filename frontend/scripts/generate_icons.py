"""
Generate PWA icons from wally-logo.svg using Pillow.
Creates: icon-192.png, icon-512.png, icon-512-maskable.png
"""

import os
from PIL import Image, ImageDraw, ImageFont

def draw_rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
    draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
    draw.pieslice([x0, y0, x0 + 2*radius, y0 + 2*radius], 180, 270, fill=fill)
    draw.pieslice([x1 - 2*radius, y0, x1, y0 + 2*radius], 270, 360, fill=fill)
    draw.pieslice([x0, y1 - 2*radius, x0 + 2*radius, y1], 90, 180, fill=fill)
    draw.pieslice([x1 - 2*radius, y1 - 2*radius, x1, y1], 0, 90, fill=fill)

def generate_icon(size, output_path, maskable=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    bg_radius = int(size * 0.15)
    
    if maskable:
        # Maskable: full background, icon centered
        bg_color = (13, 148, 136)  # Teal-500
        draw.rectangle([0, 0, size, size], fill=bg_color)
        icon_scale = 0.65
    else:
        # Standard: rounded rect background
        bg_color = (13, 148, 136)
        draw_rounded_rect(draw, (0, 0, size - 1, size - 1), bg_radius, bg_color)
        icon_scale = 0.75
    
    offset = int(size * (1 - icon_scale) / 2)
    icon_size = int(size * icon_scale)
    
    # Wallet body
    wallet_w = int(icon_size * 0.55)
    wallet_h = int(icon_size * 0.38)
    wallet_x = offset + (icon_size - wallet_w) // 2
    wallet_y = offset + int(icon_size * 0.18)
    wallet_radius = int(wallet_w * 0.08)
    
    # Wallet body (main)
    draw_rounded_rect(draw, (wallet_x, wallet_y, wallet_x + wallet_w, wallet_y + wallet_h), wallet_radius, (255, 255, 255))
    
    # Wallet flap (top portion)
    flap_h = int(wallet_h * 0.35)
    draw_rounded_rect(draw, (wallet_x, wallet_y, wallet_x + wallet_w, wallet_y + flap_h), wallet_radius, (240, 253, 250))
    
    # Card slot
    card_w = int(wallet_w * 0.55)
    card_h = int(wallet_h * 0.12)
    card_x = wallet_x + (wallet_w - card_w) // 2
    card_y = wallet_y + int(wallet_h * 0.5)
    draw_rounded_rect(draw, (card_x, card_y, card_x + card_w, card_y + card_h), int(card_h * 0.3), (13, 148, 136))
    
    # W letter
    try:
        font_size = int(icon_size * 0.24)
        font = ImageFont.truetype("arial.ttf", font_size)
    except (IOError, OSError):
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except (IOError, OSError):
            font = ImageFont.load_default()
    
    text = "W"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = (size - text_w) // 2
    text_y = wallet_y + wallet_h + (offset + icon_size - wallet_y - wallet_h - text_h) // 2
    draw.text((text_x, text_y), text, fill=(13, 148, 136), font=font)
    
    img.save(output_path, "PNG")
    print(f"Generated: {output_path} ({size}x{size})")

if __name__ == "__main__":
    public_dir = os.path.join(os.path.dirname(__file__), "..", "public")
    public_dir = os.path.abspath(public_dir)
    
    generate_icon(192, os.path.join(public_dir, "icon-192.png"))
    generate_icon(512, os.path.join(public_dir, "icon-512.png"))
    generate_icon(512, os.path.join(public_dir, "icon-512-maskable.png"), maskable=True)
    
    print("All icons generated!")

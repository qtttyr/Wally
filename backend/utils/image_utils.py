import PIL.Image
import io

def resize_image(image_bytes: bytes, max_size: tuple = (1024, 1024)) -> bytes:
    """
    Resizes an image to fit within max_size while maintaining aspect ratio.
    Reduces payload size for OCR and AI services.
    """
    image = PIL.Image.open(io.BytesIO(image_bytes))
    image.thumbnail(max_size, PIL.Image.LANCZOS)
    
    output = io.BytesIO()
    image.save(output, format="JPEG", quality=85)
    return output.getvalue()

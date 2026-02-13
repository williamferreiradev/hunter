import modal
with open("debug_image.txt", "w") as f:
    f.write(f"Attributes of Image: {dir(modal.Image)}\n")

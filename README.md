# Influenser

A Python package for training and using LoRA models to create virtual influencers using Stable Diffusion.

## Features

- Train LoRA models on custom images using DreamBooth method
- Generate images using trained LoRA models
- Support for both CPU (M1 Mac) and GPU (CUDA) training
- Automatic mixed precision training
- Checkpoint saving and resuming
- Customizable training parameters
- Easy-to-use API

## Setup

1. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Unix/macOS
# or
.\venv\Scripts\activate  # On Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Training

1. Prepare your training images:
   - Place your training images in a directory (e.g., `data/training_images/`)
   - Images should be in JPG format
   - Recommended: 10-20 high-quality images of the same person

2. Run the training:
```python
from influenser.lora_pipeline import train_lora

train_lora(
    instance_data_dir="data/training_images",
    output_dir="outputs",
    instance_prompt="a photo of sks person",  # Unique identifier
    num_train_epochs=100,
    train_batch_size=1,
    learning_rate=1e-4,
    mixed_precision="fp16",  # Use fp16 for faster training on GPU
    gradient_accumulation_steps=4,
)
```

### Generation

After training, generate images using the trained model:

```python
from influenser.lora_pipeline import generate_image

generate_image(
    prompt="a photo of sks person in a garden",
    lora_weights_path="outputs/final",
    output_path="outputs/generated_image.png",
    height=512,
    width=512,
    num_inference_steps=50,
    guidance_scale=7.5,
    seed=42,  # Fixed seed for reproducibility
)
```

### Example Script

A complete example is provided in `src/influenser/example.py`. Run it with:

```bash
python -m influenser.example
```

## Configuration

### Training Parameters

- `instance_data_dir`: Directory containing training images
- `output_dir`: Directory to save the trained model
- `instance_prompt`: Unique identifier for the person (e.g., "a photo of sks person")
- `num_train_epochs`: Number of training epochs
- `train_batch_size`: Training batch size
- `learning_rate`: Learning rate
- `mixed_precision`: Mixed precision training type ("no", "fp16", "bf16")
- `gradient_accumulation_steps`: Number of steps for gradient accumulation

### Generation Parameters

- `prompt`: Text prompt for generation
- `lora_weights_path`: Path to the trained LoRA weights
- `output_path`: Path to save the generated image
- `height`: Image height
- `width`: Image width
- `num_inference_steps`: Number of denoising steps
- `guidance_scale`: Guidance scale
- `seed`: Random seed for reproducibility

## Hardware Requirements

- GPU (recommended): NVIDIA GPU with CUDA support
- CPU: M1 Mac or equivalent
- RAM: 16GB minimum (32GB recommended)
- Storage: 10GB minimum for model weights and training data

## License

MIT License

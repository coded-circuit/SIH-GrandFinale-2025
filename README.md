# SIH 2025 — Optical‑Guided Super‑Resolution for Thermal IR Imagery

SPECTRA: Super‑Resolution Physics‑Guided Enhanced Cross‑Modal Thermal‑Optical Alignment

This repository contains our SIH‑2025 solution for the problem statement “Optical‑Guided Super‑Resolution for Thermal IR Imagery.” We fuse low‑resolution thermal IR with high‑resolution optical RGB by learning robust cross‑modal alignment and physics‑guided thermal reconstruction.

## Quick Glance

- Core idea: Cross‑modal attention to align thermal↔optical + physics‑guided thermal upsampling, under adverse conditions.
- Architecture: CrossModalGDNet → Cross‑Modal Attention + GDNet‑UNet encoder–decoder with Attribute Guidance and Residual Multi‑Attention Groups.
- Frameworks: PyTorch, TorchMetrics, Kornia, Rasterio, NumPy, Matplotlib, TQDM.
- Entry points: `train.py` (train/validate), `test.py` (evaluate), `sih-thermalimagery.ipynb` (exploration).

## Overview & Problem

Thermal IR is low‑resolution and noisy; optical RGB is high‑resolution but not temperature aware. Naïve fusion misaligns edges, hallucinates textures, and degrades physical fidelity. Public HR thermal ground‑truth is scarce, and precise cross‑spectral co‑registration is difficult.

Our approach:

- Learn thermal↔optical correspondences using cross‑modal attention (coarse→fine registration cues).
- Reconstruct physically consistent thermal details via guided encoder–decoder and multi‑attention refinement.
- Adapt guidance to scene attributes (normal/low‑illumination/fog) and handle adverse conditions.

## Model Architecture (High‑Level)

1. Cross‑Modal Attention (CMA)

   - For a thermal patch, attend to matching optical regions and vice‑versa.
   - Produces enhanced modality features with improved spatial correspondence.

2. GDNet‑UNet (Guided Encoder–Decoder)

   - Attribute Guidance Module (AGM): three feature extractors (NC, LI, FO) for different conditions.
   - Attribute‑aware Fusion Module (AFM): channel attention to adaptively weigh NC/LI/FO features.
   - Residual Multi‑Attention Groups (RMAG): refine features using the fused guidance at multiple scales.
   - Pixel‑Shuffle head upsamples thermal to the target resolution.

3. Physics‑Aware Training (lightweight proxies)
   - Encourages edge/structure fidelity and reduces mis‑registration artifacts.

## Data & Patch Extraction

- Input: GeoTIFF stacks; bands used include optical (e.g., 2/3/4) and thermal (e.g., 10/11 and 12/13 as LR/HR proxies). Adjust as per your dataset.
- `LandsatPatchDataset` extracts sliding windows and assembles inputs as `[thermal_LR(2ch) || RGB(3ch)]` with HR thermal target `(2ch)`.

## Repository Structure

```
isro_pkg/
  data/
    datasets.py           # LandsatPatchDataset, dataloaders, file listing
  models/
    attention.py          # CrossModalAttention
    blocks.py             # FeatureExtractor, AGM, AFM, RMAG, ResidualBlock
    gdnet_unet.py         # GDNetUNet (guided encoder–decoder)
    cross_modal_gdnet.py  # CrossModalGDNet, SimplifiedCrossModalGDNet
    __init__.py           # Public model API re‑exports

train.py                  # AMP training loop + validation
test.py                   # Evaluation on test split
sih-thermalimagery.ipynb  # Original exploration notebook
requirements.txt          # Python dependencies
```

## Tech Stack

- PyTorch (models, AMP training), TorchMetrics (SSIM), Kornia (losses), Rasterio (TIFF IO)
- NumPy, Matplotlib, scikit‑image (PSNR/SSIM), TQDM (progress)

## Setup (Local)

1. Python 3.10+ recommended; create a virtual environment.

```
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

2. Prepare data

- Organize your dataset under a single root directory containing `.tif` files (recursively).
- Update the paths in commands below or in `train.py`/`test.py`.

3. Optional: Add diagrams

- Save your slide images under `docs/solution_overview.png` and `docs/technical_approach.png` (or edit paths above).

## Training

```
python train.py \
  --data_root "/path/to/thermal_degraded_root" \
  # optional flags are preconfigured in TrainConfig in train.py
```

Notes

- By default, the loader samples a subset for faster runs; adjust `subset_size`, `batch_size`, and `epochs` in `TrainConfig`.
- If multiple GPUs are available, `DataParallel` is used automatically.

## Evaluation

```
python test.py \
  --data_root "/path/to/thermal_degraded_root" \
  --checkpoint "/path/to/checkpoint_xx.pth"
```

The script reports average Loss/SSIM/PSNR and visualizes a couple of samples.

## Results

| Band | Test SSIM | Test PSNR      | Avg RMSE-K |
| ---- | --------- | -------------- | ---------- |
| 1    | 0.9792    | 44.54          | 0.0082     |


## Key Components (Code Pointers)

- Dataset: `isro_pkg/data/datasets.py` → `LandsatPatchDataset`, `make_dataloaders`
- Models: `isro_pkg/models/` → `CrossModalGDNet`, `GDNetUNet`, `CrossModalAttention`, `AGM/AFM/RMAG`
- Training: `train.py` → AMP training, cosine LR schedule, validation/visualization
- Metrics/Vis: `isro_pkg/utils/metrics.py`, `isro_pkg/utils/viz.py`

## Design Choices & Rationale

- Cross‑modal attention improves alignment without explicit classical registration.
- Attribute guidance reduces failure cases under low‑light/fog, avoiding texture hallucination.
- Multi‑attention refinement injects guidance repeatedly to stabilize details.
- Lightweight physics proxies and perceptual/structural terms preserve thermal semantics.

## Limitations & Future Work

- True HR thermal ground‑truth is limited; semi‑supervised or synthetic augmentation can help.
- Extend contrastive pretraining for stronger coarse→fine alignment; explore deformable registration heads.

## License

For SIH‑2025 evaluation and research use. Contact authors for other uses.

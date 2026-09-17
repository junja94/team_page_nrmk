---
Title: RL-based Collision Avoidance
Date: 2025-01-30
Author: Neuromeka AI Group
Image: media/thumbnails/left_to_right.mp4
ThumbnailPoster: media/thumbnails/left_to_right_poster.jpg
Description: Fast, adaptive collision avoidance for high-precision industrial robots.
Publication:  Lee et al., Learning fast, tool-aware collision avoidance for collaborative robots, IEEE RA-L (2025)
Publication Link: [IEEE RA-L](https://ieeexplore.ieee.org/abstract/document/11031214), [arXiv](https://arxiv.org/abs/2508.20457)
DOI: 10.1109/LRA.2025.3579207
---


We introduce a **tool-aware** collision avoidance system that adapts to **tool size + interaction mode** and stays robust under **partial observability / occlusions** using a learned scene representation from **raw point clouds**.

## Summary video
<iframe width="560" height="315" src="https://www.youtube.com/embed/lUzTVXjYM4k?si=EJBg6ifCP7A2R4nB" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

---

## Why “tool-aware” matters
Robots don’t just move links—they move **tools**, and contact permission changes by phase:

- **Engage mode:** tool contact allowed, body contact forbidden  
- **Protective mode:** tool contact forbidden, body contact forbidden

This makes pick/insertion possible without turning “any contact” into a failure.

![Figure 1: Engage vs Protective mode](media/post_images/collision/fig1_opener.jpg)
*Figure 1 — Contact permissions by mode.*

---

## Method
**Inputs:** target EE pose + tool bounding box + mode (Engage/Protective)

1) **Learned perception (point cloud → occupancy + risk)**  
A 3D encoder–decoder predicts an **occupancy grid** and a **safety critic** (collision risk). The perception module is trained to be robust to occlusions and can remove robot/tool regions without explicit URDF filtering.

2) **Safety critic–gated hybrid controller**
- **Low risk:** use the RL output as an **initial guess**, then refine with **iterative differential IK** for high precision.
- **High risk:** directly use the **RL policy** for fast reactive avoidance.

Implementation detail: the safety critic threshold is **0.8**.

![Figure 2: System overview](media/post_images/collision/fig2_overview.jpg)
*Figure 2 — Point cloud → occupancy + critic → IK/RL switching.*

---

## Experimental notes
- Hardware: **Neuromeka Indy7** + 2-finger gripper.
- Sensing: a single **Intel RealSense D435** point cloud with limited FoV (intentionally, to stress-test occlusions).

---

## Key results
- **Realtime control:** 50 Hz.
- **Latency:** ~6 ms average update time; overall motion generation operates within **10 ms**.
- **Lightweight:** approx. **0.45 GB** GPU memory (ours) vs  approx. **4.5 GB** (GPU-based TO from Curobo + NvBlox), and **~10 ms vs 468 ms** average planning time.

### Dynamic obstacle benchmark
Table II from the paper.
The table compares collision avoidance methods under different dynamic obstacles. As obstacle speed increases from 0.2 m/s to 0.4 m/s, baselines see collision rates rise sharply, while our approach maintains the lowest collision rate at 0.4 m/s (36%) and remains collision-free in static tests (100/0).

| Method | Perception | Static (Succ/Coll) | Coll @ 0.2 m/s | Coll @ 0.4 m/s |
| :--- | :--- | :---: | ---: | ---: |
| APF | GT pose | 100 / 0 | 2 | 18 |
| MPPI | GT pose | 100 / 0 | 6 | 56 |
| APF | Convex hull | 54 / 16 | 78 | 82 |
| MPPI | Convex hull | 72 / 0 | 50 | 72 |
| APF | Learned SDF | 96 / 4 | 8 | 38 |
| MPPI | Learned SDF | 100 / 0 | 16 | 65 |
| **Ours** | **Occupancy grid** | **100 / 0** | **6** | **36** |

---

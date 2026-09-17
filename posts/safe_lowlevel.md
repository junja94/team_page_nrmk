---
Title: Feasibility-Guaranteed Safety Filter
Date: 2025-12-05
Author: POSTECH RNB Lab × Neuromeka
Image: media/thumbnails/safe_lowlevel.mp4
ThumbnailPoster: media/thumbnails/safe_lowlevel_poster.jpg
Description: A feasibility-guaranteed “safety filter” that keeps robots within critical limits even when many constraints must be enforced at once.
Publication: Ko et al., A Backup Control Barrier Function Approach for Safety-Critical Control of Mechanical Systems Under Multiple Constraints, IEEE/ASME TMECH (2025)
Publication Link: [IEEE Xplore](https://ieeexplore.ieee.org/abstract/document/10787265)
DOI: 10.1109/TMECH.2024.3504573
---

Developed in collaboration with POSTECH RNB Lab: https://rnb.postech.ac.kr/home  

Robots operating around people (and around other robots) must satisfy multiple safety limits at the same time—limits on **where the robot can go**, **how fast it can move**, and **what commands are allowed**. In practice, these limits include:
- **Time-invariant constraints** (hard limits like joint ranges, actuator bounds, permanent exclusion zones)
- **Input constraints** (torque/velocity/current bounds)
- **Time-varying constraints** (dynamic keep-out regions that change with the environment, humans, or other robots)

A common way to enforce these constraints is a real-time **safety filter**: the robot proposes a nominal command, and the filter minimally modifies it to remain safe. One popular approach is **CBF-QP**, but it has a known practical failure mode: when constraints stack up, the optimization can become **infeasible**—exactly in the corner cases where safety matters most. This work introduces a **feasibility-guaranteed safety filter** built around a reliable fallback behavior.

---

## Technical highlights
- **Feasibility-guaranteed safety filtering:** the filter is designed to remain solvable even under many simultaneous constraints, avoiding “no-solution” moments.
- **Always-enforced hard limits:** **time-invariant constraints** and **input limits** are guaranteed to be satisfied.
- **Better than “just stop”:** when the environment changes quickly and some **time-varying constraints** become too aggressive to perfectly satisfy, the method still behaves conservatively—favoring safer actions than a naïve stop-only fallback.
- **Foresighted behavior:** instead of reacting only at the current instant, the filter uses a short planning horizon to choose safer maneuvers early (useful when approaching constraints or recovering back into a safe region).
<!-- - **Validated in simulation and experiments:** the paper reports both simulation and real-world experimental validation. -->

---

## How we use it
We integrate the safety filter as a **low-level guardrail** for:
- **Humanoid robots**, where many limits must be respected simultaneously (hardware limits + workspace limits + contact-related constraints)
- **Multi-robot setups**, where coordination adds additional safety rules (e.g., separation and shared-space boundaries)

In both cases, the philosophy is the same:
1) keep the existing controller focused on task performance,  
2) add a safety layer that intervenes only when needed, and  
3) guarantee the system still has a valid command even in dense, high-risk situations.


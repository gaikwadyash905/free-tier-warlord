---
name: coding-standards
description: Per-language standards for Python, Rust, TypeScript/web, ML/DSP and infrastructure code. Load the section for the language you're writing.
---

## Python (3.11+)
Type hints, `ruff` for lint and format, `pytest`, a venv (`.scratch/venv` or the project's), `pathlib`, `logging` not `print`, pure functions in the core, timeouts and bounded concurrency on I/O. Profile before optimising; vectorise with NumPy.

## Rust
`cargo fmt`, `cargo clippy -- -D warnings`, `thiserror` in libraries and `anyhow` in binaries, no `unwrap` outside tests, APIs that take borrowed data, `tokio` for I/O and `rayon` for CPU work, minimal and documented `unsafe`.

## TypeScript / web
`strict` mode, validate outside input (zod), one error shape for the API, server-side authorisation on every request, escape output, accessible markup, no secrets in bundles.

## ML / DSP
Leak-proof train/test splits, fixed seeds, a simple baseline first, metrics that match the goal. For real-time audio state the latency budget up front.

## Infrastructure
Small multi-stage containers running as non-root, pinned dependencies, CI order lint -> test -> build -> scan, config from the environment, health endpoints, backward-compatible migrations with a tested rollback. Check with dry runs (`docker build`, `compose config`, `terraform plan`); never apply, deploy or publish.

## Git
Branch per task, small commits with conventional messages, never push or rewrite history.

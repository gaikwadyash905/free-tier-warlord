---
name: devops-delivery
description: "Use for Dockerfiles, CI/CD pipelines, infrastructure as code, Kubernetes manifests, deployment, observability and release safety. Validate with dry runs; never apply to real environments without approval."
---

## Containers
Multi-stage builds, minimal base (distroless/alpine/slim) pinned by version or digest, non-root `USER`, no secrets in layers or `ARG`, `.dockerignore`, healthcheck, one process per container, reproducible installs (lockfiles, `--frozen`/`npm ci`). Validate: `docker build`, `hadolint`, `trivy image`, `docker compose config`.

## CI/CD
Pipeline order: lint/format -> type-check -> unit tests -> build -> integration tests -> security scans (deps, secrets, SAST, image) -> artifact -> deploy. Cache dependencies, fail fast, least-privilege tokens, pin third-party actions by commit SHA, no secrets in logs, separate build from deploy, protected branches, required checks.

## Infrastructure as code
Terraform/OpenTofu: remote state with locking, modules, `fmt`, `validate`, `plan` reviewed before `apply` (never run `apply`/`destroy` without approval), tag resources, no secrets in state outputs. Kubernetes: resource requests/limits, liveness/readiness/startup probes, PodDisruptionBudget, securityContext (non-root, read-only fs, drop capabilities), NetworkPolicy, no `latest` tags. Validate: `kubectl apply --dry-run=server`/`kubeconform`, `helm lint`, `checkov`.

## Release safety
12-factor config, backward-compatible migrations (expand/migrate/contract), feature flags, canary or blue/green, automatic rollback criteria, tested rollback path, runbook. Observability: structured logs with correlation IDs, RED/USE metrics, traces, SLOs with alerts on burn rate, alerts that are actionable.

## Rules for the agent
Write and validate files locally. Never push images, apply infrastructure, deploy, or touch production/cloud accounts; present the exact commands and the plan output for the user to approve.

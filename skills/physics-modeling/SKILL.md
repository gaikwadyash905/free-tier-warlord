---
name: "Physics and Mathematical Modeling"
description: "Use for physics derivations, simulations, numerical methods, mathematical proofs, statistics and algorithm analysis that must be verified numerically with explicit units, uncertainty and result labels."
---

## Workflow
1. **Model**: system boundary, governing laws, assumptions, regime of validity, symbols with SI units (use `pint` in code).
2. **Derive** symbolically (`sympy`) keeping symbols to the end; state definitions and quantifiers for proofs; try a counterexample before trusting a conjecture.
3. **Sanity checks**: dimensional analysis, limiting cases (zero/infinite parameter, symmetry), conservation laws, order of magnitude.
4. **Numerics**: pick the method for the problem class: symplectic/high-order integrators (Verlet, Yoshida, DOP853) for Hamiltonian systems, implicit (Radau, BDF) for stiff, adaptive step with tight `rtol/atol`; `mpmath`/`fractions` for exact or high-precision cross-checks; vectorise with NumPy; fixed random seeds.
5. **Validation ladder**: analytic solution -> published benchmark -> convergence study (halve the step; measured order should match theory) -> invariant drift (energy, momentum) -> extreme parameters.
6. **Uncertainty**: separate model error, parameter error and numerical error; propagate analytically or by Monte Carlo (fixed seed, justified N, report standard error); sensitivity analysis.
7. **Algorithms / PRNG / statistics**: invariants, termination, complexity, stability. For randomness claims state the null hypothesis, tests (PractRand, TestU01, dieharder), sample sizes and what they cannot prove (not cryptographic security). For statistics: pre-state hypotheses, effect sizes with intervals, multiple-comparison correction, check assumptions.
8. **Data/ML**: provenance, units, leakage-proof splits, strong simple baseline, metrics matching the goal, error analysis; say descriptive vs predictive vs causal.

## Long simulations
Follow the `long-running-work` skill: smoke-test small, estimate runtime, run in the background with logs and checkpoints, monitor drift early. For speed: vectorise first, then `numba`/`jax`/`scipy.integrate`, profile before optimising; store arrays in `.npz`/HDF5 with parameters and seeds in the metadata; plot with matplotlib (Agg backend) to PNG in `.scratch/`.

## Environment
`python3 -m venv .scratch/venv && .scratch/venv/bin/pip install numpy scipy sympy mpmath pint pandas matplotlib statsmodels hypothesis pytest`

## Result labels (mandatory)
`proved` | `numerically verified` | `simulated` | `literature value (cite)` | `conjectured`. A numeric check is not a proof; a validated simulation is not validated reality: say which measurement would test the model.

## Report
Equations, assumptions, code path, results with units and uncertainties, validation evidence, limits of validity.

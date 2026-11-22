---
name: srs-design
description: "Use when writing a Software Requirements Specification, architecture or design document. Produces a modular spec divided into small modules with function-level signatures (parameters and return values) and full traceability."
---

## Rules
- Divide the system into small modules (single responsibility, own data, narrow interface). Each module must be implementable and testable alone.
- Specify like code: every public function/method has a signature, parameters and return value.
- Requirements are atomic, numbered and testable: `FR-<MOD>-<nn>`, `NFR-<AREA>-<nn>`, written with "shall" and a measurable acceptance criterion (numbers, not "fast").

## Document skeleton
1. Overview: purpose, scope, users, non-goals, assumptions, constraints, glossary.
2. Architecture: module diagram (Mermaid), data flow, deployment view, capacity estimate with arithmetic and first bottleneck, failure modes.
3. Requirements: functional and non-functional tables (ID, statement, priority, acceptance criterion).
4. Modules (repeat per module): responsibility, dependencies, owned data, public interface, error model, concurrency, configuration, requirement IDs.
5. Function specs (repeat per function) using the template below.
6. Data model and external interfaces (endpoints with request/response schemas, status codes, auth, versioning).
7. Verification plan, build order (dependency order of modules), risks, open questions, ADRs.
8. Traceability matrix: requirement -> module -> function -> test ID.

## Function template
```
### <Module>.<name>(<param>: <Type>, ...) -> <ReturnType>
Purpose:        one sentence
Parameters:     <param> (<Type>; constraints; units; default) ...
Returns:        <ReturnType>; meaning; special values (None, empty, sentinel)
Raises/Errors:  <ErrorType> when <condition>
Preconditions / Postconditions:
Side effects / idempotency / thread-safety:
Complexity / performance target:
Satisfies:      FR-..., NFR-...
Tests:          T-... (happy path, boundary, failure)
```

## Example
```
### auth.TokenService.issue(user_id: UUID, scopes: set[str], ttl_s: int = 900) -> Token
Purpose:        create a signed access token
Parameters:     user_id (existing user); scopes (subset of user's roles, non-empty); ttl_s (1..3600, seconds)
Returns:        Token {value: str, expires_at: datetime(UTC)}
Raises:         ValueError if scopes empty or ttl_s out of range; KeyUnavailableError if signing key missing
Side effects:   none; idempotent per (user_id, scopes, ttl_s, now)
Satisfies:      FR-AUTH-03, NFR-SEC-02
Tests:          T-AUTH-07..T-AUTH-10
```

## Before handing over
Check: every requirement has a function and a test; every function has a requirement; no module needs another's internals; numbers exist for all NFRs; open questions are listed rather than guessed.

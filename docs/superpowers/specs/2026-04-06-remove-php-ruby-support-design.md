# Remove PHP/Ruby Support Design

## Summary

This design removes official PHP and Ruby support from the Nyno main repository in a single breaking-change release. After the change, the supported extension runtimes are JavaScript and Python only. The repository will no longer ship PHP or Ruby runners, examples, drivers, benchmark assets, startup dependencies, or documentation that describes PHP/Ruby as supported languages.

The repository may retain a minimal migration note that explains the breaking change and guides existing users toward JavaScript or Python replacements. No legacy runtime, archived code path, or compatibility layer will remain in the main product.

## Goals

- Remove official PHP and Ruby runtime support from the main product.
- Remove repository assets that imply PHP/Ruby are still supported.
- Align runtime behavior, tests, examples, and documentation with the new product definition.
- Publish a clear breaking-change and migration note for affected users.

## Non-Goals

- Preserving a `legacy/` directory for PHP or Ruby assets.
- Providing a compatibility shim or deprecation period in code.
- Rewriting every historical mention of `.php` or `.rb` strings when they are not part of official runtime support.
- Broad refactoring unrelated to PHP/Ruby support removal.

## Decision

Use a one-shot removal strategy:

- Remove PHP/Ruby support from code in a single implementation cycle.
- Treat the release as a breaking change in documentation and migration notes.
- Keep only minimal migration documentation in the repository.

This matches the desired end state better than a staged deprecation approach and avoids a long-lived half-supported state.

## Current-State Findings

The existing `REMOVE_PHP_RUBY_SUPPORT.md` proposal identifies core runtime files correctly, but it is incomplete for the current repository state.

Confirmed support surfaces in the current codebase include:

- Runtime configuration and runner implementations in `src/lib-manual/runners.js` and `src/lib-manual/runners/runner.{php,rb}`.
- Port and startup wiring in `envs/ports.env`, `run-dev.sh`, `run-prod.sh`, `run-container-dev.sh`, `run-container-prod.sh`, and `tests/podman/run-container-dev.sh`.
- Distribution dependencies in `Dockerfile`, `container/entrypoint.sh`, and `scripts/check_host.sh`.
- Official runnable assets in `extensions/*/command.php`, `examples/extensions/hello-php/command.php`, `examples/extensions/hello-rb/command.rb`, `drivers/nynoclient.php`, and `drivers/nynoclient.rb`.
- Tests and sample workflows in `workflows-enabled/test_nyno_runners.nyno` and benchmark scripts such as `tests/benchmark-tests/benchmark_test_php.py` and `tests/benchmark-tests/benchmark_test_rb.py`.
- Public product positioning in `README.md`, which still markets PHP and Ruby as supported extension languages and includes PHP-specific examples and imagery.

Some repository references require classification instead of automatic deletion. For example, a string like `.php` inside a generic file-path matching regex is not necessarily a runtime-support surface. These must be reviewed individually.

## Scope Model

The implementation is organized around five support surfaces plus one release surface.

### 1. Runtime Surface

Remove PHP and Ruby from the runtime definition:

- Delete `php` and `rb` entries from `src/lib-manual/runners.js`.
- Delete `src/lib-manual/runners/runner.php` and `src/lib-manual/runners/runner.rb`.
- Remove `PE` and `RB` from `envs/ports.env`.
- Remove PHP/Ruby port checks and mappings from startup scripts.

Outcome:

- Default local and container startup paths know only about JavaScript and Python runners.

### 2. Distribution Surface

Remove PHP/Ruby from shipping and environment validation paths:

- Remove PHP, Swoole, and Ruby installation steps from `Dockerfile`.
- Remove related log output from `container/entrypoint.sh` if present.
- Remove PHP/Ruby/Swoole checks from `scripts/check_host.sh`.
- Remove duplicated support wiring from helper scripts such as podman test scripts.

Outcome:

- Building or validating the default product no longer requires PHP, Ruby, or Swoole.

### 3. Repository Asset Surface

Delete official runnable PHP/Ruby assets:

- PHP extension implementations under `extensions/*/command.php`.
- PHP and Ruby examples under `examples/extensions/`.
- PHP and Ruby client drivers under `drivers/`.
- PHP/Ruby benchmark assets that exist only to validate removed support.

Outcome:

- The repository contains no official PHP/Ruby runnable path that a user could reasonably interpret as supported.

### 4. Test and Workflow Surface

Update tests and workflows to match the reduced language set:

- Rewrite `workflows-enabled/test_nyno_runners.nyno` and its `guidata`.
- Remove or rewrite benchmark scripts and comments that assume PHP/Ruby runner indices.
- Review any test assumptions that encode language counts or ordering.

Outcome:

- Tests and sample workflows represent the actual supported product surface.

### 5. Documentation and Product Positioning Surface

Update repository documentation to match reality:

- Rewrite `README.md` language claims, setup instructions, matrices, examples, and feature descriptions.
- Remove PHP/Ruby-specific screenshots, tables, or code samples that are framed as current support.
- Ensure the main docs present Nyno as JavaScript + Python only.

Outcome:

- A new user reading the repository will not be misled into expecting PHP/Ruby support.

### 6. Migration Surface

Keep a single migration-oriented document that states:

- The release is a breaking change.
- PHP and Ruby support were removed from the main repository.
- Which classes of assets were deleted.
- Existing users should migrate extensions and integrations to JavaScript or Python.

Outcome:

- Historical context exists without keeping unsupported runtime code.

## Proposed Execution Order

Implementation should proceed in the following order.

### Phase 1. Audit and Classification

Build a classified inventory of all PHP/Ruby references:

- `runtime`
- `distribution`
- `runnable assets`
- `tests/workflows`
- `docs/product messaging`
- `incidental references`

Each item must have an explicit action: delete, rewrite, or retain with rationale.

Reason for ordering:

- Avoids accidental over-deletion.
- Prevents missing secondary entry points such as podman helpers or benchmark scripts.

### Phase 2. Runtime and Distribution Removal

Change files that define the supported product:

- `src/lib-manual/runners.js`
- `envs/ports.env`
- `run-dev.sh`
- `run-prod.sh`
- `run-container-dev.sh`
- `run-container-prod.sh`
- `tests/podman/run-container-dev.sh`
- `Dockerfile`
- `container/entrypoint.sh`
- `scripts/check_host.sh`

Reason for ordering:

- After this phase, the product no longer claims or attempts to start PHP/Ruby support.

### Phase 3. Runnable Asset Removal

Delete official PHP/Ruby implementation files:

- Extensions
- Examples
- Drivers
- Runner implementations
- Benchmarks that exist only for PHP/Ruby

Reason for ordering:

- Once runtime support is gone, asset deletion becomes mechanically safe and semantically aligned.

### Phase 4. Test and Workflow Realignment

Update sample flows and tests so they validate the new support model.

Reason for ordering:

- Tests should reflect the product after runtime surfaces are removed, not preserve stale behavior.

### Phase 5. Documentation and Migration Output

Rewrite repository documentation and add the final breaking-change note.

Reason for ordering:

- Documentation should describe the repository as it exists after code and assets have actually changed.

### Phase 6. Final Verification

Run static, build, functional, and consistency verification to confirm the removal is complete.

## Detailed Change Plan

### Runtime and Distribution Files

Keep and refine the original removal actions for:

- `src/lib-manual/runners.js`
- `envs/ports.env`
- `run-dev.sh`
- `run-prod.sh`
- `run-container-dev.sh`
- `run-container-prod.sh`
- `Dockerfile`
- `container/entrypoint.sh`
- `scripts/check_host.sh`
- `workflows-enabled/test_nyno_runners.nyno`

Extend the original plan to also include:

- `tests/podman/run-container-dev.sh`

The original proposal should be rewritten so these files are described by responsibility and acceptance criteria, not only by line deletion notes.

### Deletions

Delete the following classes of files from the main repository:

- PHP runner implementation
- Ruby runner implementation
- PHP official extension implementations
- PHP and Ruby examples
- PHP and Ruby drivers
- PHP and Ruby benchmark scripts

The exact extension list should be regenerated during implementation from the audit step rather than trusted solely from the current markdown draft.

### Documentation Updates

The original proposal must be extended to cover:

- README product summary
- Supported-language tables
- Installation and dependency instructions
- Extension authoring examples
- FAQ and positioning statements
- Any PHP/Ruby-specific imagery or screenshots still presented as current

Without this, the repository would remain externally inconsistent even if the runtime is cleaned up.

### Incidental Reference Review

Not every `.php` or `.rb` string should be auto-deleted.

Examples of references that require review:

- Language-extension comments such as those in loader code.
- Generic file path or URL extraction patterns that happen to include `.php`.

Rule:

- Remove the reference if it communicates, enables, or tests official PHP/Ruby support.
- Otherwise retain it with a short rationale recorded in the implementation audit.

## Acceptance Criteria

The work is complete only when all of the following are true.

### Product Behavior

- Default startup paths no longer reference or launch PHP or Ruby runners.
- Environment validation no longer requires PHP, Ruby, or Swoole.
- Container builds no longer install PHP, Ruby, or Swoole.

### Repository Contents

- No official PHP/Ruby runner, extension, example, driver, or benchmark asset remains in the main repository.
- Any remaining PHP/Ruby-related string references are explicitly classified as non-support references.

### Test and Workflow Behavior

- Runner test workflows no longer include PHP or Ruby steps.
- Benchmarks and tests no longer encode PHP/Ruby runner ordering or support assumptions.
- Core supported-language flows still build and run.

### Documentation Consistency

- `README.md` and other primary docs describe Nyno as supporting JavaScript and Python only.
- Users are not instructed to install PHP, Ruby, or Swoole for the main product.
- A migration/breaking-change note exists and is easy to find.

## Verification Matrix

Verification must cover four categories.

### 1. Static Residual Checks

Use repository-wide searches to confirm removal of:

- Runtime references to `php`, `ruby`, `swoole`, `PE`, and `RB`
- Official PHP/Ruby runnable assets
- README claims describing PHP/Ruby as supported languages

Any remaining matches must be reviewed and justified.

### 2. Build and Startup Checks

Verify:

- Host-check script no longer validates PHP/Ruby/Swoole
- Dev/prod startup scripts only use supported ports and runtimes
- Container build and exposed ports reflect the reduced language set

### 3. Functional and Test Checks

Verify:

- Supported-language workflows still execute
- Updated runner-test workflows no longer call removed extensions
- Benchmarks and test comments no longer encode removed runtimes

### 4. External Consistency Checks

Verify:

- README, examples, and shipped assets all describe the same product
- Migration note matches the final implementation
- No secondary script or sample path still implies PHP/Ruby support

## Risks and Mitigations

### Risk: Documentation Drift

The repository currently markets PHP/Ruby as a primary feature. If README updates are incomplete, users will still believe support exists.

Mitigation:

- Treat README and product-positioning updates as first-class work, not cleanup.

### Risk: Stale Test Semantics

Some tests and benchmarks encode runner ordering assumptions rather than simply executing files.

Mitigation:

- Review tests for language-count assumptions, not just file extensions.

### Risk: Over-Deleting Incidental References

Some `.php` mentions are generic text or file-pattern handling rather than support surfaces.

Mitigation:

- Require classification before deletion for ambiguous matches.

### Risk: Missing Secondary Entry Points

Helper scripts and test utilities may still expose removed ports or runtime names.

Mitigation:

- Include podman and auxiliary startup scripts in the initial audit.

## Recommended Implementation Task Format

The follow-on implementation plan should express each task using:

- Goal
- Files involved
- Change type: delete, rewrite, or retain-with-rationale
- Dependencies
- Completion criteria
- Verification command(s)

Recommended task groups:

1. Audit and classify all PHP/Ruby support references.
2. Remove runner and port configuration.
3. Remove startup-script and container wiring.
4. Remove Docker and host-check dependencies.
5. Delete PHP/Ruby runners, extensions, examples, drivers, and benchmark assets.
6. Rewrite workflows and tests that assume removed runtimes.
7. Review incidental references and record keep/delete decisions.
8. Rewrite README and product-positioning documentation.
9. Publish the breaking-change and migration note.
10. Run final verification across static, build, functional, and consistency checks.

## Why This Design

This design is intentionally broader than the existing `REMOVE_PHP_RUBY_SUPPORT.md` draft. The draft is directionally correct for core runtime cleanup, but it underestimates the amount of repository state that still communicates official PHP/Ruby support. A successful removal must update the product definition everywhere a user, contributor, or maintainer can encounter it.

The chosen design keeps the implementation focused:

- Remove support completely from the main product.
- Keep only minimal migration guidance.
- Avoid a long-lived legacy surface.
- Audit ambiguous references instead of blindly deleting string matches.

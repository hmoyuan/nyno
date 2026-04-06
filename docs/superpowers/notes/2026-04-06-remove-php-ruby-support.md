# PHP/Ruby Support Removal

## What changed

Nyno no longer provides official PHP or Ruby support in the main repository.

After this change, the supported extension runtimes in the main product are:

- JavaScript
- Python

The repository no longer ships PHP/Ruby runtime wiring, runner implementations, example extensions, client drivers, or benchmark coverage for those languages.

## Why it changed

This repository now reflects the current product definition directly instead of keeping legacy runtime surfaces that imply broader support than the product actually maintains.

The goal of this breaking change is to keep the main repository aligned around the supported JavaScript and Python workflow-extension paths, reduce maintenance overhead, and remove setup and distribution dependencies that were only needed for PHP, Ruby, or Swoole.

## Breaking-change scope

This is a breaking change for users who depended on PHP or Ruby assets shipped by this repository.

You are affected if you previously relied on any of the following from the main repo:

- PHP or Ruby runner implementations
- PHP or Ruby client drivers
- PHP example or Ruby example extension entrypoints
- Official PHP extension entrypoints under `extensions/*/command.php`
- PHP/Ruby benchmark scripts or runner test expectations
- Docker, container, or host setup paths that assumed PHP, Ruby, or Swoole were part of the supported runtime set

## Removed asset classes

The repository no longer includes these classes of PHP/Ruby support assets:

- Runtime definitions and port wiring for PHP/Ruby
- PHP/Ruby startup and container wiring
- PHP, Ruby, and Swoole distribution dependencies
- `src/lib-manual/runners/runner.php`
- `src/lib-manual/runners/runner.rb`
- `drivers/nynoclient.php`
- `drivers/nynoclient.rb`
- `examples/extensions/hello-php/command.php`
- `examples/extensions/hello-rb/command.rb`
- Official PHP extension entrypoints under `extensions/*/command.php`
- `tests/benchmark-tests/benchmark_test_php.py`
- `tests/benchmark-tests/benchmark_test_rb.py`

The remaining public product messaging in `README.md` now describes Nyno as a JavaScript-and-Python product.

## Migration guidance

If you still have PHP or Ruby integrations based on this repository, migrate them before taking updates that include this change.

Recommended migration path:

1. Port repository-based PHP or Ruby extensions to JavaScript or Python.
2. Replace uses of repository-shipped PHP/Ruby drivers with the JavaScript or Python drivers that remain in the repo, or with your own integration layer.
3. Remove PHP, Ruby, and Swoole assumptions from local setup, CI, container builds, and operational runbooks that were based on the old repository layout.
4. Re-test any workflows that previously referenced PHP/Ruby-backed steps to confirm they now use supported JavaScript or Python implementations.

Practical checks for existing users:

- Search your workflows and extension directories for removed PHP/Ruby entrypoints such as `command.php`, `command.rb`, `runner.php`, `runner.rb`, `nynoclient.php`, and `nynoclient.rb`.
- Search your setup, CI, Docker, and deployment scripts for PHP, Ruby, Swoole, or removed environment variables such as the old PHP/Ruby engine port settings `PE` and `RB`.
- Confirm your runtime expectations match the current `README.md`, which now documents JavaScript and Python only.

## Verification summary

Users upgrading to this release should expect the repository and primary product documentation to reflect the same end state:

- JavaScript and Python are the supported extension runtimes in the main repository.
- PHP and Ruby runners, repository-shipped drivers, example entrypoints, and benchmark assets are no longer provided.
- Container, startup, and host dependency guidance no longer treat PHP, Ruby, or Swoole as part of the supported runtime set.
- `README.md` documents the current JavaScript/Python product, and this note documents the breaking-change history for removed PHP/Ruby support.

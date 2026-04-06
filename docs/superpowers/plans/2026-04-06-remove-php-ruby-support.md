# Remove PHP/Ruby Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove official PHP and Ruby support from the main Nyno repository, leaving JavaScript and Python as the only supported extension runtimes, with tests and docs updated to match.

**Architecture:** The work proceeds by first classifying all remaining PHP/Ruby support surfaces, then removing runtime and distribution wiring, then deleting runnable assets, then realigning tests and workflows, and finally rewriting public documentation and migration notes. The implementation deliberately distinguishes official support surfaces from incidental string references so the repository is cleaned without breaking unrelated behavior.

**Tech Stack:** Node.js, shell scripts, Docker/Podman scripts, Python benchmark scripts, YAML workflows, Markdown docs, Git

---

## File Map

### Runtime definition

- Modify: `src/lib-manual/runners.js`
- Modify: `envs/ports.env`

### Startup and distribution wiring

- Modify: `run-dev.sh`
- Modify: `run-prod.sh`
- Modify: `run-container-dev.sh`
- Modify: `run-container-prod.sh`
- Modify: `tests/podman/run-container-dev.sh`
- Modify: `Dockerfile`
- Modify: `container/entrypoint.sh`
- Modify: `scripts/check_host.sh`
- Delete: `container/bin/swoole.so`

### Runnable assets to remove

- Delete: `src/lib-manual/runners/runner.php`
- Delete: `src/lib-manual/runners/runner.rb`
- Delete: `drivers/nynoclient.php`
- Delete: `drivers/nynoclient.rb`
- Delete: `examples/extensions/hello-php/command.php`
- Delete: `examples/extensions/hello-rb/command.rb`
- Delete: each official PHP extension under `extensions/*/command.php`
- Delete or rewrite: PHP/Ruby-only benchmark assets under `tests/benchmark-tests/`

### Tests and sample workflows

- Modify: `workflows-enabled/test_nyno_runners.nyno`
- Modify or delete: `tests/benchmark-tests/benchmark_test_php.py`
- Modify or delete: `tests/benchmark-tests/benchmark_test_rb.py`
- Modify: any benchmark comments or test assumptions that encode PHP/Ruby indices

### Documentation and migration

- Modify: `README.md`
- Modify or replace: `docs/superpowers/notes/2026-04-06-remove-php-ruby-support.md`

### Audit artifacts

- Create: `docs/superpowers/plans/2026-04-06-remove-php-ruby-support.md`
- Create or update during implementation notes: local audit checklist in commit messages or worker notes

## Task 1: Audit and classify all PHP/Ruby references

**Files:**
- Modify: `docs/superpowers/plans/2026-04-06-remove-php-ruby-support.md`
- Review: `README.md`
- Review: `src/lib-manual/runners.js`
- Review: `envs/ports.env`
- Review: `run-dev.sh`
- Review: `run-prod.sh`
- Review: `run-container-dev.sh`
- Review: `run-container-prod.sh`
- Review: `tests/podman/run-container-dev.sh`
- Review: `tests/podman/run-container-prod.sh`
- Review: `Dockerfile`
- Review: `container/entrypoint.sh`
- Review: `container/bin/swoole.so`
- Review: `scripts/check_host.sh`
- Review: `workflows-enabled/test_nyno_runners.nyno`
- Review: `tests/benchmark-tests/*`
- Review: `drivers/*`
- Review: `examples/extensions/*`
- Review: `extensions/*`

- [ ] **Step 1: Generate the initial classified search results**

Run:

```bash
rg -n "php|ruby|\\.php|\\.rb|PHP|Ruby|Swoole|PE=|RB=" README.md src envs run-*.sh tests drivers examples extensions Dockerfile container scripts workflows-enabled tests/podman/run-container-prod.sh container/bin/swoole.so
```

Expected:

- A raw list of matches covering runtime wiring, docs, tests, examples, and asset files.

- [ ] **Step 2: Split findings into explicit classes**

Record the findings in worker notes using this structure:

```text
runtime:
- src/lib-manual/runners.js
- envs/ports.env

distribution:
- Dockerfile
- scripts/check_host.sh
- tests/podman/run-container-dev.sh
- tests/podman/run-container-prod.sh
- run-dev.sh
- run-prod.sh
- run-container-dev.sh
- run-container-prod.sh
- container/bin/swoole.so

runnable_assets:
- src/lib-manual/runners/runner.php
- src/lib-manual/runners/runner.rb
- drivers/nynoclient.php
- drivers/nynoclient.rb
- examples/extensions/hello-php/command.php
- examples/extensions/hello-rb/command.rb
- extensions/.../command.php

tests_workflows:
- workflows-enabled/test_nyno_runners.nyno
- tests/benchmark-tests/benchmark_test_php.py
- tests/benchmark-tests/benchmark_test_rb.py
- tests/benchmark-tests/benchmark_test_js.py
- tests/benchmark-tests/benchmark_test_py.py
- tests/benchmark-tests/benchmark_test_bash.py
- tests/benchmark-tests/benchmark_test_nyno_log.py

docs_product_messaging:
- README.md
- docs/superpowers/notes/2026-04-06-remove-php-ruby-support.md

incidental_references:
- src/lib-manual/functions/loadfunctiondatanyno.js
- extensions/nyno-extract-urls/command.js
- fix-port-already-in-use.sh
```

- [ ] **Step 3: Mark each finding with delete, rewrite, or retain-with-rationale**

Use this decision table:

```text
delete:
- official runnable PHP/Ruby asset
- runtime/distribution support wiring

rewrite:
- workflows, benchmark comments, README, migration docs
- helper scripts and comments that still enumerate removed runtime names

retain-with-rationale:
- generic file-extension parsing or URL regexes
- historical comments that do not claim current support and are still useful
```

- [ ] **Step 4: Re-run the search to confirm no support surface was missed before editing**

Run:

```bash
rg --files tests/benchmark-tests drivers examples/extensions extensions src/lib-manual/runners
```

Expected:

- A concrete file list the worker can compare against planned deletions.

- [ ] **Step 5: Commit the audit checkpoint**

Run:

```bash
git status --short
git add docs/superpowers/plans/2026-04-06-remove-php-ruby-support.md
git commit -m "docs: add PHP/Ruby removal implementation plan"
```

Expected:

- The implementation plan is committed before code changes begin.

## Task 2: Remove runtime configuration and port wiring

**Files:**
- Modify: `src/lib-manual/runners.js`
- Modify: `envs/ports.env`

- [ ] **Step 1: Write the target runtime shape into notes before editing**

Target `RUNNERS` object:

```js
const RUNNERS = {
  js: {
    host,
    port: ports["JS"] ?? 9072,
    cmd: "node",
    file: path.resolve(__dirname, "../../dist-ts/nyno/src/lib-manual/runners/runner.js"),
    checkFunction: makeCheckFunction(["command.js", "command.ts", "command.wasm"])
  },
  py: {
    host,
    port: ports["PY"] ?? 9006,
    cmd: "uv",
    file: path.resolve(__dirname, "runners/runner.py"),
    checkFunction: makeCheckFunction(["command.py"])
  }
};
```

- [ ] **Step 2: Update `src/lib-manual/runners.js` to remove `php` and `rb`**

Required edit shape:

```js
const RUNNERS = {
  js: {
    host,
    port: ports["JS"] ?? 9072,
    cmd: "node",
    file: path.resolve(__dirname, "../../dist-ts/nyno/src/lib-manual/runners/runner.js"),
    checkFunction: makeCheckFunction(["command.js", "command.ts", "command.wasm"])
  },
  py: {
    host,
    port: ports["PY"] ?? 9006,
    cmd: "uv",
    file: path.resolve(__dirname, "runners/runner.py"),
    checkFunction: makeCheckFunction(["command.py"])
  }
};
```

- [ ] **Step 3: Update `envs/ports.env` to remove `PE` and `RB`**

Target file content:

```bash
# workflow
WF=9024

# gui
GU=9057

# engines, PY=python, JS=node
PY=9006
JS=9072

# change this,so no other processes can execute code!
SECRET="change_me"

# For container/docker/podman 0.0.0.0 is needed instead of localhost
HOST="0.0.0.0"
```

- [ ] **Step 4: Run a static check for removed runtime keys**

Run:

```bash
rg -n "ports\\['PE'\\]|ports\\['RB'\\]|command\\.php|command\\.rb|runner\\.php|runner\\.rb" src/lib-manual/runners.js envs/ports.env
```

Expected:

- No matches.

- [ ] **Step 5: Commit the runtime removal**

Run:

```bash
git add src/lib-manual/runners.js envs/ports.env
git commit -m "refactor: remove PHP and Ruby runtime configuration"
```

Expected:

- Runtime config changes are isolated in a dedicated commit.

## Task 3: Remove startup-script and helper-script support wiring

**Files:**
- Modify: `run-dev.sh`
- Modify: `run-prod.sh`
- Modify: `run-container-dev.sh`
- Modify: `run-container-prod.sh`
- Modify: `tests/podman/run-container-dev.sh`

- [ ] **Step 1: Update local startup port checks**

Target port-check block for both `run-dev.sh` and `run-prod.sh`:

```bash
# --- Check all required ports ---
check_port "$PY"
check_port "$JS"
```

- [ ] **Step 2: Update container helper scripts to print only supported engines**

Target engine display block:

```bash
echo "Workflow Port:$WF"
echo "GUI Port:$GU"
echo "Engines:"
echo "PY:$PY"
echo "JS:$JS"
```

- [ ] **Step 3: Update container port mappings to remove `PE` and `RB`**

Target mapping pattern:

```bash
$CONTAINER_TOOL run -it \
-v $(pwd)/workflows-enabled:/nyno/workflows-enabled \
-v $(pwd)/envs:/nyno/envs \
-v $(pwd)/output:/nyno/output \
-v $(pwd)/extensions:/nyno/extensions \
-p "$PY:$PY" -p "$JS:$JS" \
-p "$WF:$WF" -p "$GU:$GU" $IMAGE_NAME bash
```

- [ ] **Step 4: Verify no startup helper still references removed ports**

Run:

```bash
rg -n "\\$PE|\\$RB|PHP:|RB:" run-dev.sh run-prod.sh run-container-dev.sh run-container-prod.sh tests/podman/run-container-dev.sh tests/podman/run-container-prod.sh
```

Expected:

- No matches.

- [ ] **Step 5: Commit the startup-script cleanup**

Run:

```bash
git add run-dev.sh run-prod.sh run-container-dev.sh run-container-prod.sh tests/podman/run-container-dev.sh tests/podman/run-container-prod.sh
git commit -m "refactor: remove PHP and Ruby startup wiring"
```

Expected:

- All startup-script changes are captured in one commit.

## Task 4: Remove distribution dependencies and host checks

**Files:**
- Modify: `Dockerfile`
- Modify: `container/entrypoint.sh`
- Modify: `scripts/check_host.sh`
- Delete: `container/bin/swoole.so`

- [ ] **Step 1: Remove PHP, Swoole, and Ruby installation from `Dockerfile`**

Target outcome requirements:

```text
- No php8.4 packages
- No swoole.so copy
- No /etc/php/.../20-swoole.ini write
- No ruby-full install
- EXPOSE line contains only 9024 9057 9006 9072
```

Target exposed ports line:

```Dockerfile
EXPOSE 9024 9057 9006 9072
```

- [ ] **Step 2: Remove PHP/Ruby status logging from `container/entrypoint.sh` if present**

Allowed engine log shape:

```bash
echo "PY:$PY"
echo "JS:$JS"
```

- [ ] **Step 3: Simplify `scripts/check_host.sh` to the supported dependency set**

Target runtime-check block:

```bash
check_cmd node "Node.js (>= 22)" "https://nodejs.org/en/download"
check_cmd bun "Bun" "curl -fsSL https://bun.sh/install | bash"
check_cmd python3 "Python 3 (>= 3.10)" "Install via distro or https://www.python.org"
check_cmd uv "uv (Astral)" "curl -fsSL https://astral.sh/uv/install.sh | bash"
check_cmd psql "PostgreSQL Client" "sudo apt install postgresql-client"
```

Forbidden remnants:

```text
check_php_ext
check_cmd php
check_cmd ruby
swoole
```

- [ ] **Step 4: Run a dependency-string residual check**

Run:

```bash
rg -n "php|ruby|swoole|PHP|Ruby|Swoole|PE|RB" Dockerfile container/entrypoint.sh scripts/check_host.sh
```

Expected:

- No matches that indicate official support remains.

- [ ] **Step 5: Commit the distribution cleanup**

Run:

```bash
git add Dockerfile container/entrypoint.sh scripts/check_host.sh
git commit -m "build: remove PHP Ruby and Swoole dependencies"
```

Expected:

- Distribution-surface changes are isolated in one commit.

## Task 5: Delete official PHP/Ruby runnable assets

**Files:**
- Delete: `src/lib-manual/runners/runner.php`
- Delete: `src/lib-manual/runners/runner.rb`
- Delete: `drivers/nynoclient.php`
- Delete: `drivers/nynoclient.rb`
- Delete: `examples/extensions/hello-php/command.php`
- Delete: `examples/extensions/hello-rb/command.rb`
- Delete: each official PHP extension implementation under `extensions/*/command.php`
- Delete: `tests/benchmark-tests/benchmark_test_php.py`
- Delete: `tests/benchmark-tests/benchmark_test_rb.py`

- [ ] **Step 1: Regenerate the exact delete list from the repository**

Run:

```bash
rg --files src/lib-manual/runners drivers examples/extensions extensions tests/benchmark-tests | rg "(runner\\.(php|rb)$|nynoclient\\.(php|rb)$|hello-(php|rb)|command\\.php$|benchmark_test_(php|rb)\\.py$)"
```

Expected:

- A concrete file list to delete, including all official PHP extension entrypoints.

- [ ] **Step 2: Delete runner, driver, and example assets**

Files to remove:

```text
src/lib-manual/runners/runner.php
src/lib-manual/runners/runner.rb
drivers/nynoclient.php
drivers/nynoclient.rb
examples/extensions/hello-php/command.php
examples/extensions/hello-rb/command.rb
```

- [ ] **Step 3: Delete official PHP extension entrypoints**

Delete every file matching this supported-removal pattern:

```text
extensions/*/command.php
```

Minimum currently expected set:

```text
extensions/ai-mistral-text/command.php
extensions/nyno-extract-file-paths/command.php
extensions/nyno-if/command.php
extensions/nyno-pki-create-keypairs/command.php
extensions/nyno-pki-decrypt/command.php
extensions/nyno-pki-encrypt/command.php
extensions/nyno-pki-sign/command.php
extensions/nyno-pki-verify/command.php
extensions/nyno-sort-kv/command.php
```

- [ ] **Step 4: Delete PHP/Ruby-only benchmark assets**

Files to remove:

```text
tests/benchmark-tests/benchmark_test_php.py
tests/benchmark-tests/benchmark_test_rb.py
```

- [ ] **Step 5: Verify the deleted classes are gone**

Run:

```bash
rg --files src/lib-manual/runners drivers examples/extensions extensions tests/benchmark-tests | rg "(\\.php$|\\.rb$|benchmark_test_(php|rb)\\.py$)"
```

Expected:

- No matches for official PHP/Ruby runnable assets.

- [ ] **Step 6: Commit the asset deletions**

Run:

```bash
git add -A src/lib-manual/runners drivers examples/extensions extensions tests/benchmark-tests
git commit -m "refactor: remove PHP and Ruby repository assets"
```

Expected:

- Runnable asset removals are captured in one deletion-focused commit.

## Task 6: Rewrite workflows and remaining benchmark assumptions

**Files:**
- Modify: `workflows-enabled/test_nyno_runners.nyno`
- Modify: `tests/benchmark-tests/benchmark_test_js.py`
- Modify: `tests/benchmark-tests/benchmark_test_py.py`
- Modify: `tests/benchmark-tests/benchmark_test_bash.py`
- Modify: `tests/benchmark-tests/benchmark_test_nyno_log.py`

- [ ] **Step 1: Rewrite the workflow to remove PHP/Ruby nodes**

Target workflow body:

```yaml
workflow:
  - id: 1
    step: nyno-echo
    args:
      - ${i}
    next:
      - 2
      - 4
      - 5
  - id: 2
    step: hello-py
    args:
      - hello from hello-py
    next: []
  - id: 4
    step: hello
    args:
      - hello from js
    next: []
  - id: 5
    step: echo
    args:
      - hello from bash
    next: []
route: /test_nyno_runners
```

- [ ] **Step 2: Rewrite `guidata` so it only references ids `2`, `4`, and `5`**

Required `guidata` properties:

```text
- root node next must be ["2","4","5"]
- no "php test" node
- no "ruby test" node
- edge list contains only 1->2, 1->4, 1->5
```

- [ ] **Step 3: Update benchmark comments and index assumptions**

Target comment shape:

```python
q_payload = {"path": "/test_runners", "i": 0, "name": "Alice"}  # 0=js, 1=py, 2=bash
```

Allowed benchmark files after removal:

```text
tests/benchmark-tests/benchmark_test_js.py
tests/benchmark-tests/benchmark_test_py.py
tests/benchmark-tests/benchmark_test_bash.py
tests/benchmark-tests/benchmark_test_nyno_log.py
```

- [ ] **Step 4: Verify no stale workflow or benchmark assumptions remain**

Run:

```bash
rg -n "hello-php|hello-rb|php test|ruby test|0=js, 1=php|1=php|4=ruby|ruby|php" workflows-enabled tests/benchmark-tests
```

Expected:

- No matches that describe removed runtimes as supported test cases.

- [ ] **Step 5: Commit the workflow and benchmark realignment**

Run:

```bash
git add workflows-enabled/test_nyno_runners.nyno tests/benchmark-tests
git commit -m "test: realign workflows and benchmarks to JS and Python"
```

Expected:

- Workflow and benchmark assumptions are aligned with the new runtime set.

## Task 7: Review incidental references and keep only non-support matches

**Files:**
- Review: `src/lib-manual/functions/loadfunctiondatanyno.js`
- Review: `extensions/nyno-extract-urls/command.js`
- Review: any remaining files surfaced by residual searches

- [ ] **Step 1: Search for remaining PHP/Ruby mentions after code and asset removal**

Run:

```bash
rg -n "php|ruby|\\.php|\\.rb|PHP|Ruby|Swoole|PE|RB" README.md src tests drivers examples extensions Dockerfile container scripts workflows-enabled
```

Expected:

- A much smaller list than the original audit.

- [ ] **Step 2: Remove any remaining support-signaling references**

Delete or rewrite matches such as:

```text
- comments that enumerate php/rb as supported loader languages
- stale support claims in non-README docs
- old workflow comments describing removed runtime indices
```

- [ ] **Step 3: Retain only incidental references with explicit rationale**

Allowed retained example:

```js
/\b(?:\.{1,2}\/[A-Za-z0-9_\-./]+|[A-Za-z0-9_\-]+(?:\/[A-Za-z0-9_\-./]+)*\.(?:php|html?|svg|gif|jpg|png|css|js))(?=[^\]])/g;
```

Rationale:

```text
This is generic path extraction, not runtime support.
```

- [ ] **Step 4: Verify residual matches are intentional**

Run:

```bash
rg -n "php|ruby|\\.php|\\.rb|PHP|Ruby|Swoole|PE|RB" src extensions tests scripts Dockerfile container workflows-enabled
```

Expected:

- Only incidental references or migration docs remain.

- [ ] **Step 5: Commit the incidental-reference cleanup**

Run:

```bash
git add src extensions tests scripts Dockerfile container workflows-enabled
git commit -m "chore: remove remaining PHP and Ruby support references"
```

Expected:

- Remaining non-doc references are intentional and reviewable.

## Task 8: Rewrite README and public product messaging

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Rewrite the product summary to JavaScript and Python only**

Required replacements:

```text
"Python, Ruby, PHP & JavaScript" -> "Python and JavaScript"
"py,js,php,ruby" -> "py,js"
"Python, PHP, JavaScript, and Ruby" -> "Python and JavaScript"
```

- [ ] **Step 2: Rewrite the engine table to remove PHP and Ruby columns**

Target table shape:

```markdown
| Python3 (multi-process workers engine) | JavaScript + NodeJS (multi-process workers engine) |
|----------|----------|
| ![Python3](...) | ![JavaScript + NodeJS](...) |
```

- [ ] **Step 3: Remove PHP-specific install and example guidance**

Required README edits:

```text
- remove PHP/Swoole/Ruby from dependency lists
- remove the PHP extension example section
- remove or replace PHP/Ruby imagery presented as current support
```

Preferred example section after rewrite:

```markdown
In Nyno, every **Python and JavaScript** script becomes a reusable command that runs in its own high-performing worker engine.
```

- [ ] **Step 4: Run a README residual check**

Run:

```bash
rg -n "php|ruby|PHP|Ruby|Swoole|py,js,php,ruby|Python, PHP|Extend with Python, PHP" README.md
```

Expected:

- No matches that present PHP/Ruby as current support.

- [ ] **Step 5: Commit the README rewrite**

Run:

```bash
git add README.md
git commit -m "docs: update README for JS and Python only"
```

Expected:

- Public product messaging matches the codebase.

## Task 9: Publish the breaking-change migration note

**Files:**
- Modify: `docs/superpowers/notes/2026-04-06-remove-php-ruby-support.md`

- [ ] **Step 1: Convert the markdown draft from internal delete notes to migration-oriented documentation**

Target document sections:

```markdown
# PHP/Ruby Support Removal

## What changed
## Why it changed
## Breaking-change scope
## Removed asset classes
## Migration guidance
## Verification summary
```

- [ ] **Step 2: Write explicit migration guidance for affected users**

Required migration statements:

```text
- PHP and Ruby official support has been removed from the main repository.
- Existing PHP/Ruby extensions should be ported to JavaScript or Python.
- Existing PHP/Ruby drivers shipped by this repository are no longer provided.
```

- [ ] **Step 3: Make the migration note reflect actual implementation results**

Required content source:

```text
- final deleted asset classes
- final supported runtimes
- final verification categories
```

- [ ] **Step 4: Run a consistency check between README and migration note**

Run:

```bash
rg -n "JavaScript|Python|PHP|Ruby|Swoole" README.md docs/superpowers/notes/2026-04-06-remove-php-ruby-support.md
```

Expected:

- README describes the current product.
- Migration note explains the removed support historically.

- [ ] **Step 5: Commit the migration doc update**

Run:

```bash
git add docs/superpowers/notes/2026-04-06-remove-php-ruby-support.md
git commit -m "docs: publish PHP and Ruby removal migration note"
```

Expected:

- The repository retains migration context without keeping legacy support assets.

## Task 10: Run final verification and prepare for execution handoff

**Files:**
- Review: all modified and deleted files

- [ ] **Step 1: Run the final residual search**

Run:

```bash
rg -n "php|ruby|\\.php|\\.rb|PHP|Ruby|Swoole|PE=|RB=" README.md src envs run-*.sh tests drivers examples extensions Dockerfile container scripts workflows-enabled tests/podman/run-container-prod.sh container/bin/swoole.so
```

Expected:

- Only migration-doc or explicitly justified incidental matches remain.

- [ ] **Step 2: Run build-oriented verification**

Run:

```bash
npm run build:node
bash scripts/check_host.sh
```

Expected:

- Build succeeds.
- Host checker no longer asks for PHP, Ruby, or Swoole.

- [ ] **Step 3: Run startup and workflow verification**

Run:

```bash
bash run-dev.sh
```

Expected:

- Only JavaScript and Python runtimes are wired from the startup path.
- No PHP/Ruby port checks or runner startup logs appear.

- [ ] **Step 4: Run repository consistency verification**

Run:

```bash
git status --short
git log --oneline -5
```

Expected:

- Worktree contains only the intended implementation changes.
- Commit history shows small focused commits for runtime, scripts, assets, tests, docs, and migration.

- [ ] **Step 5: Commit the verification checkpoint**

Run:

```bash
git add -A
git commit -m "chore: finalize PHP and Ruby support removal"
```

Expected:

- The removal lands as a coherent final state after all verification passes.

## Self-Review

### Spec coverage

Covered requirements:

- Runtime surface removal: Tasks 2, 3, and 4
- Distribution surface removal: Tasks 3 and 4
- Repository asset removal: Task 5
- Test and workflow realignment: Task 6
- Documentation and product positioning: Task 8
- Migration surface: Task 9
- Verification matrix: Task 10
- Incidental reference review: Task 7

No spec gaps remain.

### Placeholder scan

The plan avoids `TODO`, `TBD`, and vague directives like "add appropriate handling." Each task includes:

- exact file paths
- explicit delete or rewrite targets
- concrete target snippets
- commands with expected outcomes

### Type and naming consistency

Consistent names used throughout:

- Supported runtimes: JavaScript and Python only
- Removed runtime keys: `php`, `rb`, `PE`, `RB`
- Migration document path: `docs/superpowers/notes/2026-04-06-remove-php-ruby-support.md`
- Workflow ids retained in runner sample: `2`, `4`, `5`

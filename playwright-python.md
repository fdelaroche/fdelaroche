# Playwright Python

## Installation

First, create a `venv`, then

```bash
pip install playwright
playwright install --with-deps
```

Add `--only-shell` to only install the required dependencies for headless operation, like in a CI pipeline.

## Markers

[Full doc](https://docs.pytest.org/en/stable/how-to/mark.html)

**To skip a test**

```python
@pytest.mark.skip
```
...with a reason

```python
@pytest.mark.skip(reason="not ready")
```

**To mark test to specific category and run selectively**

Create the custom mark in the pytest configuration file

```toml
[pytest]
markers = [
    "smoke",
    "test: a test marker"
]
```
*Note that everything past the `:` after the mark name is an optional description.*

Then, add the mark `smoke` in the test file:

```python
@pytest.mark.smoke
```

Then, run only `smoke` tests with `pytest -m smoke`. Boolean expression are supported, e.g. `pytest -m "api and slow"` for tests marked as `api` and `slow`.

**To mark a test as expected to fail**

```pyton
@pytest.mark.xfail(reason="not yet implemented")
```

## Assertions

See [doc](https://playwright.dev/python/docs/test-assertions).

## Fixtures

Check all the fixtures sets of folder `tests` with
```bash
 pytest --fixtures tests
```
The path matters because Pytest will load each `conftest.py` of the test's path, starting from the root directory, thus child `conftest.py` will override parent `conftest.py` file.
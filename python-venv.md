# Python `pyenv`/`venv`/`pip`

## pyenv

Set the version of Python for the current folder:

```bash
pyenv local x.xx
```

## Create a new `venv`

```bash
python -m venv .venv
```

and activate it with

```bash
source .venv/bin/activate
```

From there, any call to `pip` will install the packages inside of the activated `venv`.

To deactivate the `venv`, use

```bash
deactivate
```

Save the currently installed dependencies with

```bash
pip freeze > requirements.txt
```

...which can be reinstalled with

```bash
pip install -r requirements.txt
```

A human readable format for the currently installed packages can be obtained using `pip list`.

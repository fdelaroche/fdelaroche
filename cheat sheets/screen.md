# How to use the `screen` terminal multiplexer

## Install on CentOS

- Add EPEL repository: `dnf install epel-release`
- Install Screen: `dnf install screen`

## Parameters

### List current sessions

 `screen -ls`

### Create a session with a specific name

`screen -S <nameOfTheSession>`

### Attach back to a session

- `screen -r <pid>` The PID does not have to be complete, just long enough so only one matches. For instance with two sessions `12301` and `12108`, `121` is enough to reattach to the second one.
- `screen -r <sessionName>` Same as above, the session name does not have to be compete, just long enough.
- If only one session exists, the `-r` parameter can be left empty.

### Send a command to a session

`screen -X -S <pid or session> <command>`

For example, to quit a session with PID 12108: `screen -X -S 12108 quit`.

### Run a command in a new detached session

`screen -d -m <command>`

It is possible to attach to the new session to track progress but it will end when the command ends.

## Commands

All commands start with `Ctrl + a`.

- `?`: Show key bindings
- `:`: Allows to type the command by its name in the `?` key binding screen.

Each `screen` session can hold multiple windows.

## Sessions

- `d`: Detach from the current session.
- `x`: Lock the current session. Enter your login password to unlock it.
- `t`: Display the current time, hostname, and load average.

## Windows

- `c`: Create a new window within the current session.
- `w`: List current windows (Note that the list may appear in the Terminal window title, not *in* the Terminal window).
- `n`: Move to the next window, `p` for the previous window.
- `k`: Kill the current window, press `y` to validate.
- `\`: Kill the current session and all windows within it, press `y` to validate.
- `0` to `9`: Select window `n`.
- `"`: List all windows and allow to select one.
- `A`: Change the name to the current window.

## Panes

- `|`: Split the current window vertically. The left pane will contain the current window, the right one will have none. Use other commands to attach a window to it or create a new one.
- `S`: Split the current window horizontally.
- `tab`: Move to the next pane
- `X`: Delete the current pane, the window is not destoyed.

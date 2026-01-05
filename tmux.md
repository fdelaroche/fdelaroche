# How to use the `tmux` terminal multiplexer

## Install on CentOS

- Install tmux: `dnf install tmux`

## Parameters

### Create a new session

`tmux new -s <name>`

### List current sessions

`tmux list-sessions`, or `ls`

### Attach to a session

`tmux attach -t <name>`

### Kill a session

`tmux kill-session -t <name or id>`

## Commands

All commands start with `Ctrl + b`.

In `tmux`, each session can have multiple window, and each window can be divided in multiple pane displayed at the same time.

- `?`: Show key bindings.
- `:`: Allows to type the command by its name in the `?` key binding screen.
- `r`: Reload config file (`.tmux.conf`).

## Session

- `s`: list sessions.
- `$`: rename current session.
- `d`: Detach from the session, or call `tmux detach`.

## Windows

- `c`: Create a new window within the current session.
- `,`: Rename the current window.
- `n`: Move to the next window, `p` for the previous window.
- `1` through `0`: Select window `n`.
- `w`: List current windows (Note that the list may appear in the Terminal window title, not *in* the Terminal window).

## Panes

- `%`:  Split the current window vertically. `"` to split vertically.
- `h`: move to the left pane.
- `l`: move to the right pane
- `j`: move to the pane bellow.
- `k`: move to the pane above.
- `o`: toggle between panes.
- `{` and `}`: swap with the previous/next pane.
- `!`: Break the pane out of the window
- `x`: kill the current pane
- `z`: Zoom in or out the current pane

## Multiple users on the same session

When that happens, the window size will be limited to the smallest screen of the sessions and the unused space on the larger session will be filled with dots. In order to list and detach another session, do a `shift D` (capital D). A list of all the session will show up. Select the one to end and press enter.

Alternatively, all other sessions can be detached by issuing `tmux detach -a`.

## Launch `tmux` when SSH into a box

### Add a local alias into your shell config (`~/.bash_profile` or `~/.zprofile`)

*Update the alias and host name accordingly.*

```bash
# SSH aliases
alias ssh-outaram1="ssh mybox -t tmux a"
```

### Add an auto-run into your remote shell config

```bash
# tmux
if [-z "$TMUX" ]; then
tmux attach -t default || tmux new -s default
```

*Note that both can be set at the same time.*

## SSH aliases

```bash
alias ssh-outaram1="ssh mybox -t tmux a"
```

## Enable mouse scrollback

Add the folling snipet into `~/.tmux.conf`

```bash
set -g mouse on
```

Or temporarly enable it in `tmux` with `^b+:`, then `set -g mouse`.

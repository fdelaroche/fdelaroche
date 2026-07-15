# Shell job control

- While a command is running, stop and return to the shell with ^Z.
- List jobs with `jobs`.
- Get back to a job in the foreground: `fg %x`, with `x` the job number. Optional if a single job is running.
- Resume a job in the background: `bg %x`. The job can output to the screen but can't receive keyboard input.
- Start a job in the background by adding `&` to the end of its command (with a space between `&` and the command).
- Kill a job with `kill %x`.
- Separate a job from the current shell to allow for clean logout with `disown %x` (similar to `nohup`)

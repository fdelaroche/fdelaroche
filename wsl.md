# WSL

Here's a practical reference for working with Windows Subsystem for Linux 2:

## Basic WSL Commands

**Managing distributions:**

- `wsl --list` or `wsl -l` - List installed distributions
- `wsl --list --verbose` or `wsl -l -v` - List with detailed info (version, state)
- `wsl --set-default <DistroName>` - Set default distribution
- `wsl --set-version <DistroName> 2` - Convert distro to WSL2
- `wsl --unregister <DistroName>` - Uninstall a distribution
- `wsl --install -d <DistroName>` - Install a specific distribution

**Starting and stopping:**

- `wsl` - Start default distribution
- `wsl -d <DistroName>` - Start specific distribution
- `wsl --shutdown` - Shut down all distributions and WSL2 VM
- `wsl --terminate <DistroName>` - Terminate specific distribution

**Running commands:**

- `wsl <command>` - Run command in default distro
- `wsl -d <DistroName> <command>` - Run command in specific distro
- `wsl --user <username> <command>` - Run as specific user

## File System Access

**From Windows to WSL:**

- Access Linux files: `\\wsl$\<DistroName>\home\username`
- Or in File Explorer: `\\wsl.localhost\Ubuntu\`

**From WSL to Windows:**

- Windows C: drive is mounted at `/mnt/c/`
- Example: `/mnt/c/Users/YourName/Documents`

**Convert paths:**

- `wslpath 'C:\Users\Name'` - Convert Windows path to WSL path
- `wslpath -w /home/user` - Convert WSL path to Windows path

## Configuration

**WSL config file** (`C:\Users\<YourUsername>\.wslconfig`):

```ini
[wsl2]
memory=4GB
processors=2
localhostForwarding=true
swap=8GB
```

**Per-distro config** (`/etc/wsl.conf` inside Linux):

```ini
[boot]
systemd=true

[network]
generateResolvConf=true

[interop]
enabled=true
appendWindowsPath=true
```

## Networking

- WSL2 uses a virtualized network adapter
- Access Windows localhost from WSL: Connect to host IP (usually works with `localhost`)
- Access WSL from Windows: Use `localhost:<port>` for services running in WSL
- Get WSL IP: `ip addr show eth0`
- Get Windows host IP from WSL: `cat /etc/resolv.conf | grep nameserver`

## Performance Tips

- Store project files in Linux filesystem (`/home/user/`) for better performance
- Avoid accessing Linux files from Windows frequently
- Use `wsl --shutdown` to free memory when not in use
- Disable antivirus scanning on WSL directories for faster I/O

## Useful Commands

**System management:**

- `wsl --update` - Update WSL2 kernel
- `wsl --status` - Check WSL status and version
- `wsl --version` - Show WSL version info

**Export/Import distributions:**

- `wsl --export <DistroName> <FileName.tar>` - Backup a distribution
- `wsl --import <DistroName> <InstallLocation> <FileName.tar>` - Restore from backup

## Disable swap

To configure a specific VM, open `/etc/wsl.conf`, or edit/create `%UserProfile%/.wslconfig` for system-wide configuration, then add `swap=0` to the `[wsl2]` section.

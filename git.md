# Git

## Show current branch, not listing every other branch in the process

```bash
git branch --show-current
```

## Retrieve remote branch locally

```bash
git fetch
git checkout -b <remote_branch> origin/<remote_branch>
```

## List branches by ages

```bash
git for-each-ref --sort=committerdate refs/heads/ --format='%(HEAD) %(color:yellow)%(refname:short)%(color:reset) - %(color:red)%(objectname:short)%(color:reset) - %(contents:subject) - %(authorname) (%(color:green)%(committerdate:relative)%(color:reset))'
```

## Create empty commit to trigger a new PR build

```bash
git commit --allow-empty -m "trigger new build"
```

## Remove a committed file but keep in available

```bash
git rm --cached <file>
```

## List changes that happened on branch main since the feature branch was created

```bash
git diff $(git merge-base main HEAD)..main
```

Append the name of a file to only see the changes that happened to that file.

### To only list the files

```bash
git diff $(git merge-base main HEAD)..main --name-status
```

### Path of the root of the current git repository

```bash
git rev-parse --show-toplevel
```

An alias can be created to move directly to it like so:

```bash
alias cdgitroot='cd $(git rev-parse --show-toplevel)'
```

## Get and apply a commit patch

1. Get the patch of the wanted commit on GHE by adding `.patch` to the end of the commit url. E.g.: <https://github.ibm.com/BusinessAnalytics/install-ca/commit/9289ac580d7f9bd29a8f507ee1cfe0764e8533e3.patch>
1. **-or-** create one with `git format-patch -1 <sha>`. `<sha>` can be `HEAD` ([doc](https://git-scm.com/docs/git-format-patch))
1. Save and copy that file at the root of the cloned repository.
1. Apply the patch with `git apply 9289ac580d7f9bd29a8f507ee1cfe0764e8533e3.patch` ([doc](https://git-scm.com/docs/git-apply))

Note:

- Check for error before applying with `git apply --check  <patch_file>`
- Get summary of the patch with `git apply --stat <patch_file>`
- This works even if the repo is not managed by git (no `.git` folder)

## List files stored using git-lfs

```bash
git lfs ls-files
```

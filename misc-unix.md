# Miscellaneous shell scripts

## Convert the charset of a file to utf-8

This assumes the charset of the original file is unknown and that `file` is able to correctly guess it.
If not, replace the command substitution part with the correct one. Use `iconv -l` for a full list of the supported character sets.

```bash
iconv -f "$(file -bi {input_file} | sed -n 's/.*charset=//p')" -t utf-8 "{input_file}" -o "{output_file}"
```
## Tools

- [Bash checker](https://www.shellcheck.net/)

## Tutorials

- [Test operators](https://kapeli.com/cheat_sheets/Bash_Test_Operators.docset/Contents/Resources/Documents/index)
- [Arrays](https://linuxconfig.org/how-to-use-arrays-in-bash-script)
- [getops](https://wiki.bash-hackers.org/howto/getopts_tutorial)
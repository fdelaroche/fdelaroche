# Bookmarklet

## Pause execution with a specific keystroke

Here `shift`+`Z` for example.

Note that it will not work if the page already has an event listener on `document` that blocks propagation.

```javascript
javascript:document.addEventListener("keydown",e=>{if(e.shiftKey&&e.key==="Z")debugger})
```

## Toggle __design mode__

```javascript
javascript:(function(){document.designMode=(document.designMode== 'on')?%27off%27:%27on%27})();
```

export function initializeContextMenuBlock(root = document) {
  const block = event => event.preventDefault();
  const options = { capture: true };
  root.addEventListener('contextmenu', block, options);
  return () => root.removeEventListener('contextmenu', block, options);
}

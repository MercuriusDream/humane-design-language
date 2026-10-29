/** A root's radius as a fraction of its own shorter side, capped at 2px. */
export const ROOT_RADIUS_FRACTION = 0.05;
export const ROOT_RADIUS_MAX = 2;

export function rootRadius(width: number, height: number) {
  return Math.min(ROOT_RADIUS_MAX, Math.round(ROOT_RADIUS_FRACTION * Math.min(width, height) * 10) / 10);
}

/**
 * Sets --radius-root on every [data-root] element from its own size, and keeps it current as the root
 * resizes, including frame by frame while it morphs. The depths inside derive from it in base.css.
 * Returns a function that stops watching.
 */
export function watchRootRadii(scope: ParentNode = document) {
  const sizes = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const box = entry.borderBoxSize[0];
      (entry.target as HTMLElement).style.setProperty('--radius-root', `${rootRadius(box.inlineSize, box.blockSize)}px`);
    }
  });
  const watched = new Set<Element>();
  const scan = () => {
    for (const el of scope.querySelectorAll('[data-root]')) {
      if (!watched.has(el)) {
        watched.add(el);
        sizes.observe(el);
      }
    }
    for (const el of watched) {
      if (!el.isConnected || !el.hasAttribute('data-root')) {
        sizes.unobserve(el);
        watched.delete(el);
      }
    }
  };
  const tree = new MutationObserver(scan);
  tree.observe(scope, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-root'] });
  scan();
  return () => {
    tree.disconnect();
    sizes.disconnect();
  };
}

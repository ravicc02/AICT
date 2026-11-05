/** Resolve public assets under the Vite deployment base (root or repository path). */
export function assetUrl(path: string) {
  return import.meta.env.BASE_URL + path.replace(/^\//, "");
}

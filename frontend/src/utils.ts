export function checkNotNull<T>(x: T | null | undefined): T {
  if (x == null) {
    throw new Error();
  }

  return x;
}

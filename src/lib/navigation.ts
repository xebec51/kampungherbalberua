type NavigationTarget = {
  href: string;
};

export function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function hasActiveChild(
  pathname: string,
  children: NavigationTarget[],
) {
  return children.some((child) => isActivePath(pathname, child.href));
}

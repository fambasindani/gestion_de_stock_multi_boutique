import { Link as RouterLink } from "react-router-dom";
import type { ComponentProps, ReactNode } from "react";

type RouterLinkProps = ComponentProps<typeof RouterLink>;

export interface LinkProps
  extends Omit<RouterLinkProps, "to" | "prefetch" | "scroll"> {
  href: string;
  children?: ReactNode;
  prefetch?: boolean;
  scroll?: boolean;
}

export default function Link({
  href,
  prefetch: _prefetch,
  scroll: _scroll,
  ...props
}: LinkProps) {
  return <RouterLink to={href} {...props} />;
}

export { Link };

export function useLinkStatus(): { pending: boolean } {
  return { pending: false };
}

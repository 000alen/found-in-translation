import type { ConnectionTheme } from "@/lib/connections/types";

type ConnectionLinkProps = {
  id: string;
  path: string;
  theme: ConnectionTheme;
};

/** A single tapered triangle link between two passages. */
export function ConnectionLink({ id, path, theme }: ConnectionLinkProps) {
  return (
    <path
      id={id}
      d={path}
      fill={theme.fill}
      stroke={theme.stroke}
      strokeWidth={theme.strokeWidth ?? 1}
      strokeLinejoin="round"
    />
  );
}

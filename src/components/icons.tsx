import type { SVGProps } from "react";

export function VocalPenLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 5a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h- период" />
      <path d="M14 5l4-4" />
      <path d="M6 5v14" />
      <path d="M10 5v14" />
      <path d="M2 12h2" />
      <path d="M6 12h2" />
    </svg>
  );
}

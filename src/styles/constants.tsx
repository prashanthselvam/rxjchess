import { keyframes } from "@emotion/react";

const breakpoints = [1024, 768];

export const mq = breakpoints.map((bp) => `@media (max-width: ${bp}px)`);

export const appear = keyframes`
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    `;

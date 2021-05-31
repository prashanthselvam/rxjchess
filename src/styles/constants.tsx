import { keyframes } from "@emotion/react";

export const mq = [
  `@media (max-width: 1024px)`,
  `@media (max-width: 768px)`,
  `@media (max-width: 480px)`,
];

export const appear = keyframes`
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    `;

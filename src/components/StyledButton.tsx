import { ButtonHTMLAttributes } from "react";
import styled from "@emotion/styled";

interface StyledButtonProps extends ButtonHTMLAttributes<any> {
  variant?: "primary" | "secondary";
}

export const StyledButton = styled.button`
  font-family: oswald;
  font-size: 2rem;
  margin: 12px 6px 0 6px;
  padding: 8px 16px;
  width: fit-content;
  border: 1px solid hsl(0, 0%, 80%);
  border-radius: 4px;
  ${({ variant = "primary" }: StyledButtonProps) =>
    variant === "primary"
      ? "color: hsl(0, 0%, 96%); background-color: hsl(226, 47%, 27%)"
      : "color: hsl(0, 0%, 20%); background-color: hsl(0, 0%, 96%)"};
  --webkit-appearance: none;
  &:disabled {
    color: hsl(0, 0%, 70%);
    background-color: hsl(0, 0%, 98%);
  }
  &:hover:enabled {
    cursor: pointer;
    filter: brightness(85%);
  }
`;

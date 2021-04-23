import { actions, store } from "src/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface DrawerMenuOptionProps {
  text: string;
  icon: IconProp;
  onClick: (o: GameModes) => void;
  position: number;
  selected: boolean | undefined;
}

const DrawerMenuOption = ({
  text,
  icon,
  onClick,
  selected,
  position,
}: DrawerMenuOptionProps) => {
  return (
    <div
      css={{
        transition: "all .2s ease-in",
        position: "relative",
        width: "33.3%",
        padding: "0 5rem",
        opacity: selected === false && "0%",
        transform: selected && `translateX(${-100 * position}%)`,
      }}
    >
      <div
        onClick={onClick}
        css={{
          transition: "all .2s",
          backgroundColor: "rgba(255,255,255,0.85)",
          borderRadius: "1.5rem",
          padding: "1.5rem",
          fontSize: "2rem",
          border: "none",
          textDecoration: "none",
          "&:hover": {
            transform: "translateY(-.3rem)",
            boxShadow: "0 4rem 4rem rgba(0,0,0,.2)",
            cursor: "pointer",
            "&>.icon": {
              color: "rgb(33,33,33)",
            },
          },
        }}
      >
        <h3 css={{ fontWeight: 500 }}>{text}</h3>
        <FontAwesomeIcon
          className={"icon"}
          css={{
            margin: "3rem 0 5rem 0",
            fontSize: "5rem",
            color: "rgb(36,54,45)",
          }}
          icon={icon}
        />
      </div>
    </div>
  );
};

export default DrawerMenuOption;

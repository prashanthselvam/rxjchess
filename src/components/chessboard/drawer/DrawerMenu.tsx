import React from "react";
import DrawerMenuOption from "./DrawerMenuOption";

const DrawerMenu = () => {
  return (
    <div
      css={{
        boxShadow: "inset .1rem 1rem 1.5rem 0 #000000",
        position: "absolute",
        display: "flex",
        left: "2.5%",
        width: "95%",
        height: "88%",
        paddingTop: "3rem",
        paddingLeft: "6rem",
        paddingRight: "6rem",
        justifyContent: "space-between",
      }}
    >
      <DrawerMenuOption text="PLAY A FRIEND" />
      <DrawerMenuOption text="PLAY THE COMPUTER" />
      <DrawerMenuOption text="PLAY YOURSELF" />
    </div>
  );
};

export default DrawerMenu;

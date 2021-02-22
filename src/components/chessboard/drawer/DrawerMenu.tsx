import React from "react";
import DrawerMenuOption from "./DrawerMenuOption";

const DrawerMenu = () => {
  return (
    <div
      css={{
        boxShadow: "inset 1px 10px 15px 0px #000000",
        position: "absolute",
        display: "flex",
        left: "2.5%",
        width: "95%",
        height: "88%",
        paddingTop: 30,
        paddingLeft: 60,
        paddingRight: 60,
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

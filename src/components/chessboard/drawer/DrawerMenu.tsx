import React from "react";
import DrawerMenuOption from "./DrawerMenuOption";
import {
  faUserFriends,
  faLaptopCode,
  faChessBoard,
} from "@fortawesome/free-solid-svg-icons";

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
        paddingLeft: "7rem",
        paddingRight: "7rem",
        justifyContent: "space-between",
      }}
    >
      <DrawerMenuOption text="PLAY A FRIEND ONLINE" icon={faUserFriends} />
      <DrawerMenuOption text="PLAY THE COMPUTER" icon={faLaptopCode} />
      <DrawerMenuOption text="PLAY OVER THE BOARD" icon={faChessBoard} />
    </div>
  );
};

export default DrawerMenu;

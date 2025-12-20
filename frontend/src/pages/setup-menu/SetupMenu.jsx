import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";

import TableGames from "../../components/setupMenu/TableGames";
import DigitalGames from "../../components/setupMenu/DigitalGames";
import MenuItems from "../../components/setupMenu/MenuItems";

import "../../styles/setupMenu.css";

const SetupMenu = () => {
  const [activeTab, setActiveTab] = useState("table");

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <div className="setup-menu-page">
          <h5>← Setup menu</h5>

          <div className="setup-tabs">
            <button
              className={activeTab === "table" ? "active" : ""}
              onClick={() => setActiveTab("table")}
            >
              MANAGE TABLE GAMES
            </button>

            <button
              className={activeTab === "digital" ? "active" : ""}
              onClick={() => setActiveTab("digital")}
            >
              MANAGE DIGITAL GAME
            </button>

            <button
              className={activeTab === "menu" ? "active" : ""}
              onClick={() => setActiveTab("menu")}
            >
              MANAGE MENU
            </button>
          </div>

          {activeTab === "table" && <TableGames />}
          {activeTab === "digital" && <DigitalGames />}
          {activeTab === "menu" && <MenuItems />}
        </div>
      </div>
    </div>
  );
};

export default SetupMenu;

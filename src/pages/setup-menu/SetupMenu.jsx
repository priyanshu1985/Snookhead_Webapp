import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import { TableGamesIcon, DigitalGamesIcon, FoodIcon, BackIcon } from "../../components/common/Icons";

import TableGames from "../../components/setupMenu/TableGames";
import DigitalGames from "../../components/setupMenu/DigitalGames";
import MenuItems from "../../components/setupMenu/MenuItems";

import "../../styles/setupMenu.css";

const SetupMenu = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const [activeTab, setActiveTab] = useState("table");
  const navigate = useNavigate();

  const tabs = [
    { key: "table", label: "Table Games", shortLabel: "Tables", Icon: TableGamesIcon },
    { key: "digital", label: "Digital Games", shortLabel: "Digital", Icon: DigitalGamesIcon },
    { key: "menu", label: "Menu Items", shortLabel: "Menu", Icon: FoodIcon },
  ];

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main setup-dashboard-main">
        <Navbar />

        <div className="setup-menu-page">
          {/* Header */}
          <div className="setup-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <BackIcon size={18} />
            </button>
            <h5>Setup Menu</h5>
          </div>

          {/* Tabs */}
          <div className="setup-tabs-wrapper">
            <div className="setup-tabs">
              {tabs.map((tab) => {
                const IconComponent = tab.Icon;
                return (
                  <button
                    key={tab.key}
                    className={activeTab === tab.key ? "active" : ""}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <span className="tab-icon">
                      <IconComponent size={20} />
                    </span>
                    <span className="tab-label-full">{tab.label}</span>
                    <span className="tab-label-short">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="setup-content">
            {activeTab === "table" && <TableGames />}
            {activeTab === "digital" && <DigitalGames />}
            {activeTab === "menu" && <MenuItems />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupMenu;

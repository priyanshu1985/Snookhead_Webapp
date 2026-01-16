const InventoryTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "Cafe Asset", label: "CAFE ASSET" },
    { id: "Packed Food", label: "PACKED FOOD" },
    { id: "Prepared Food", label: "PREPARED FOOD" },
    { id: "Sticks", label: "STICKS" },
    { id: "Tables", label: "TABLES" },
    { id: "Other", label: "OTHER" },
  ];

  return (
    <div className="inventory-tabs" style={{overflowX: 'auto', whiteSpace: 'nowrap'}}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? "active" : ""}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default InventoryTabs;

import { useState } from "react";

const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    outline: 0;
  }
`;

interface MegaNavProps {
  currentPath: string;
}

export function MegaNav({ currentPath }: MegaNavProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <>
      <style>{globalStyles}</style>
      <header>
        <nav>
          <a href="/">
            <img src="/logo.svg" alt="CampSpots" />
          </a>
        </nav>

        <nav>
          <div className="megamenu">
            <div
              className="megamenu-navitem"
              onClick={() =>
                setActiveMenu(activeMenu === "plan" ? null : "plan")
              }
            >
              Plan Your Trip
            </div>

            <div
              className="megamenu-submenu"
              style={{
                display: "flex",
                opacity: activeMenu === "plan" ? 1 : 0,
                pointerEvents: activeMenu === "plan" ? "auto" : "none",
              }}
            >
              <a href="/campgrounds">All Campgrounds</a>
              <a href="/rv-parks">RV Parks</a>
              <a href="/cabins">Cabins</a>
            </div>

            <div
              className="megamenu-navitem"
              onClick={() =>
                setActiveMenu(activeMenu === "stay" ? null : "stay")
              }
            >
              Ways to Stay
            </div>
            <div
              className="megamenu-submenu"
              style={{
                display: "flex",
                opacity: activeMenu === "stay" ? 1 : 0,
                pointerEvents: activeMenu === "stay" ? "auto" : "none",
              }}
            >
              <a href="/tents">Tents</a>
              <a href="/glamping">Glamping</a>
            </div>

            <div
              className="megamenu-navitem"
              onClick={() =>
                setActiveMenu(activeMenu === "resources" ? null : "resources")
              }
            >
              Resources
            </div>
            <div
              className="megamenu-submenu"
              style={{
                display: "flex",
                opacity: activeMenu === "resources" ? 1 : 0,
                pointerEvents: activeMenu === "resources" ? "auto" : "none",
              }}
            >
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

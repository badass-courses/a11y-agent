import { useState } from "react";

const routes: Record<string, { title: string; content: string }> = {
  "/": {
    title: "Home",
    content: "Welcome to CampSpots! Find your next adventure.",
  },
  "/campgrounds": {
    title: "Campgrounds",
    content: "Browse over 500 campgrounds across the country.",
  },
  "/about": {
    title: "About",
    content: "Founded in 2020 by outdoor enthusiasts.",
  },
  "/contact": {
    title: "Contact",
    content: "Get in touch with our support team.",
  },
};

export function App() {
  const [currentPath, setCurrentPath] = useState("/");
  const page = routes[currentPath] || routes["/"];

  const navigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPath(path);
  };

  return (
    <div className="app">
      <header>
        <nav>
          <a href="/" onClick={navigate("/")}>
            <img src="/logo.svg" alt="CampSpots" />
          </a>

          <ul>
            {Object.entries(routes).map(([path, route]) => (
              <li key={path}>
                <a
                  href={path}
                  onClick={navigate(path)}
                  className={currentPath === path ? "active" : ""}
                >
                  {route.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main>
        <h1>{page.title}</h1>
        <p>{page.content}</p>
      </main>
    </div>
  );
}

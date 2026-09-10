"use client";

import { useRef, useState } from "react";
import { CartButton } from "@/components/cart-button";
import { useSearch, useJumpToProducts } from "@/components/search-context";

const NAV_LINKS = [
  { href: "#new", label: "สินค้าแนะนำ" },
  { href: "#collections", label: "หมวดสินค้า" },
  { href: "#team", label: "ทีมแมวทั้ง 12" },
  { href: "#about", label: "เกี่ยวกับเรา" },
];

export function SiteHeader() {
  const { query, setQuery, searchOpen, setSearchOpen } = useSearch();
  const [menuOpen, setMenuOpen] = useState(false);
  const jump = useJumpToProducts();
  const inputRef = useRef<HTMLInputElement>(null);

  function toggleSearch() {
    const next = !searchOpen;
    setSearchOpen(next);
    if (next) requestAnimationFrame(() => inputRef.current?.focus());
  }

  function runSearch() {
    jump();
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="PawPicks Thailand หน้าแรก">
          <span className="brand-mark" aria-hidden="true">
            🐾
          </span>
          <span>
            <strong>PawPicks</strong>
            <small>THAILAND</small>
          </span>
        </a>
        <nav
          id="nav"
          aria-label="เมนูหลัก"
          className={menuOpen ? "open" : undefined}
        >
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            id="searchToggle"
            aria-label="เปิดช่องค้นหา"
            aria-expanded={searchOpen}
            onClick={toggleSearch}
          >
            ⌕
          </button>
          <CartButton />
          <button
            className="menu-button"
            id="menuToggle"
            aria-label="เปิดเมนู"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </header>

      <div
        className={`search-panel${searchOpen ? " open" : ""}`}
        id="searchPanel"
      >
        <label htmlFor="siteSearch">ค้นหาสินค้า</label>
        <div>
          <input
            ref={inputRef}
            id="siteSearch"
            type="search"
            placeholder="เช่น น้ำพุแมว หรือ กล้องดูแมว"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch();
            }}
          />
          <button id="searchButton" onClick={runSearch}>
            ค้นหา
          </button>
        </div>
      </div>
    </>
  );
}

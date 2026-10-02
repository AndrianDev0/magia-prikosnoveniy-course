"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function ArtworkMenu({ accountPath, coursePath, onHome = false }: {
  accountPath: string;
  coursePath: string;
  onHome?: boolean;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false;
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape" && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  return (
    <div className="artwork-menu-cover">
      <details className="artwork-menu" ref={menu}>
        <summary aria-label="Меню сайта">
          <span className="artwork-menu-icon" aria-hidden="true"><i /><i /><i /></span>
        </summary>
        <nav className="artwork-menu-panel" aria-label="Меню сайта" onClick={event => {
          if ((event.target as HTMLElement).closest("a") && menu.current) menu.current.open = false;
        }}>
          <Link href="/">Главная</Link>
          <Link href={onHome ? "#tariffs" : "/#tariffs"}>Тарифы</Link>
          <Link href={coursePath}>Перейти к курсу</Link>
          <a href={accountPath}>Личный кабинет</a>
          <details className="artwork-menu-documents">
            <summary>Документы <span aria-hidden="true">⌄</span></summary>
            {siteConfig.documents.map(document => <a key={document.href} href={document.href}>{document.label}</a>)}
          </details>
        </nav>
      </details>
    </div>
  );
}

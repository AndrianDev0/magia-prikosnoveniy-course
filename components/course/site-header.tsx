"use client";

import { Camera, Menu, Send, UserRound } from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";

type HeaderProps = {
  user: { displayName: string } | null;
  signInPath: string;
  signOutPath: string;
  isAdmin?: boolean;
};

const nav = [
  { href: "/#about", label: "О курсе" },
  { href: "/#program", label: "Программа" },
  { href: "/#author", label: "Автор" },
  { href: "/#prices", label: "Тарифы" },
];

function Navigation({ user, signInPath, signOutPath, isAdmin, mobile = false }: HeaderProps & { mobile?: boolean }) {
  return (
    <nav className={mobile ? "mobile-nav" : "desktop-nav"} aria-label={mobile ? "Мобильная навигация" : "Основная навигация"}>
      {nav.map((item) =>
        mobile ? (
          <SheetClose asChild key={item.href}><a href={item.href}>{item.label}</a></SheetClose>
        ) : (
          <a href={item.href} key={item.href}>{item.label}</a>
        ),
      )}
      {user ? (
        <>
          <a href="/profile">Личный кабинет</a>
          {isAdmin ? <a href="/admin">Администратор</a> : null}
          <a href={signOutPath}>Выйти</a>
        </>
      ) : (
        <a href={signInPath} target="_top">Войти</a>
      )}
    </nav>
  );
}

export function SiteHeader(props: HeaderProps) {
  const accountPath = props.user ? "/profile" : props.signInPath;
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Магия прикосновений — на главную">
        <span>Эмиль</span>
      </Link>
      <a className="account-button" href={accountPath} target={props.user ? undefined : "_top"} aria-label={props.user ? "Личный кабинет" : "Войти"}><UserRound /></a>
      <Sheet>
        <SheetTrigger asChild>
          <button className="menu-button" type="button" aria-label="Открыть меню"><Menu /></button>
        </SheetTrigger>
        <SheetContent className="mobile-sheet">
          <SheetHeader>
            <SheetTitle className="display-title">Меню</SheetTitle>
            <SheetDescription>Разделы курса и личный кабинет</SheetDescription>
          </SheetHeader>
          <Navigation {...props} mobile />
          <div className="sheet-socials" aria-label="Социальные сети">
            {siteConfig.socials.map((social) => (
              <a href={social.href} aria-label={social.label} key={social.label}>
                {social.label === "ВКонтакте" ? "VK" : social.label === "Telegram" ? <Send aria-hidden="true" /> : <Camera aria-hidden="true" />}
              </a>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

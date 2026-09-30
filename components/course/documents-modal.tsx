"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DOCUMENT_VERSION, siteConfig } from "@/config/site";

const STORAGE_KEY = `magic-touch-documents-${DOCUMENT_VERSION}`;

export function DocumentsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (window.localStorage.getItem(STORAGE_KEY) !== "dismissed") setOpen(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next) window.localStorage.setItem(STORAGE_KEY, "dismissed");
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="document-dialog">
        <DialogHeader>
          <span className="dialog-kicker">Перед началом</span>
          <DialogTitle className="display-title">Документы</DialogTitle>
          <DialogDescription>
            Пожалуйста, ознакомьтесь с условиями участия. Сейчас открываются
            демонстрационные версии — финальные тексты будут добавлены перед публикацией.
          </DialogDescription>
        </DialogHeader>
        <div className="document-links">
          {siteConfig.documents.map((document) => (
            <a key={document.href} href={document.href} target="_blank" rel="noreferrer">
              <FileText aria-hidden="true" />
              <span>{document.label}</span>
              <small>Открыть</small>
            </a>
          ))}
        </div>
        <button className="button button-primary" type="button" onClick={() => changeOpen(false)}>
          Продолжить
        </button>
      </DialogContent>
    </Dialog>
  );
}

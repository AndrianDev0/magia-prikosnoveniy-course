"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DOCUMENT_VERSION, siteConfig } from "@/config/site";

const STORAGE_KEY = `magic-touch-documents-${DOCUMENT_VERSION}`;

export function DocumentsModal() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [dataProcessingAccepted, setDataProcessingAccepted] = useState(false);

  const canContinue = offerAccepted && dataProcessingAccepted;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        if (window.localStorage.getItem(STORAGE_KEY) !== "dismissed") setOpen(true);
      } catch {
        setOpen(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function changeOpen(next: boolean) {
    if (!next) {
      try {
        window.localStorage.setItem(STORAGE_KEY, "dismissed");
      } catch {
        // The modal must still close when storage is blocked by the browser.
      }
    }
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        className="document-dialog"
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          titleRef.current?.focus();
        }}
        onEscapeKeyDown={(event) => {
          if (!canContinue) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (!canContinue) event.preventDefault();
        }}
      >
        {/* Original outlined Figma artwork; semantic controls remain above it. */}
        <picture className="document-artwork-picture">
          <source media="(max-width: 720px)" srcSet="/course/documents-modal-figma.png" width="940" height="764" />
          <Image className="document-artwork" src="/course/documents-desktop-figma.png" alt="" width={1649} height={1341} unoptimized priority />
        </picture>
        <DialogHeader className="document-dialog-header">
          <DialogTitle ref={titleRef} tabIndex={-1} className="document-mobile-title sr-only">
            Сначала ознакомьтесь с документами:
          </DialogTitle>
          <DialogDescription className="sr-only">
            Откройте документы, примите условия оферты и согласие на обработку
            персональных данных, чтобы продолжить.
          </DialogDescription>
        </DialogHeader>
        <nav className="document-links" aria-label="Документы курса">
          {siteConfig.documents.map((document) => (
            <a
              key={document.href}
              href={document.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${document.label} (откроется в новой вкладке)`}
            >
              <span className="document-link-label">{document.label}</span>
            </a>
          ))}
        </nav>
        <div className="document-consents" role="group" aria-label="Обязательные согласия">
          <label className="document-consent">
            <Checkbox
              className="document-checkbox"
              checked={offerAccepted}
              onCheckedChange={(checked) => setOfferAccepted(checked === true)}
            />
            <span className="document-consent-label sr-only">Я принимаю условия Публичной оферты.</span>
          </label>
          <label className="document-consent">
            <Checkbox
              className="document-checkbox"
              checked={dataProcessingAccepted}
              onCheckedChange={(checked) => setDataProcessingAccepted(checked === true)}
            />
            <span className="document-consent-label sr-only">
              Я даю согласие на обработку моих персональных данных в соответствии с
              Политикой обработки персональных данных.
            </span>
          </label>
        </div>
        <DialogClose asChild>
          <button
            className="document-continue"
            type="button"
            disabled={!canContinue}
            aria-describedby="document-consent-hint"
          >
            <span className="document-continue-label">Продолжить</span>
          </button>
        </DialogClose>
        <span id="document-consent-hint" className="sr-only">
          Чтобы продолжить, отметьте оба согласия.
        </span>
      </DialogContent>
    </Dialog>
  );
}

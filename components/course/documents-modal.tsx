"use client";

import { useEffect, useRef, useState } from "react";
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
        <DialogHeader className="document-dialog-header">
          <DialogTitle ref={titleRef} tabIndex={-1} className="document-dialog-title">
            Сначала ознакомьтесь
            <br />
            с документами:
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
              {document.label}
            </a>
          ))}
        </nav>
        <DialogClose asChild>
          <button
            className="button document-continue"
            type="button"
            disabled={!canContinue}
            aria-describedby="document-consent-hint"
          >
            Продолжить
          </button>
        </DialogClose>
        <span id="document-consent-hint" className="sr-only">
          Чтобы продолжить, отметьте оба согласия.
        </span>
        <div className="document-consents" role="group" aria-label="Обязательные согласия">
          <label className="document-consent">
            <Checkbox
              className="document-checkbox"
              checked={offerAccepted}
              onCheckedChange={(checked) => setOfferAccepted(checked === true)}
            />
            <span>Я принимаю условия Публичной оферты.</span>
          </label>
          <label className="document-consent">
            <Checkbox
              className="document-checkbox"
              checked={dataProcessingAccepted}
              onCheckedChange={(checked) => setDataProcessingAccepted(checked === true)}
            />
            <span>
              Я даю согласие на обработку моих персональных данных в соответствии с
              Политикой обработки персональных данных.
            </span>
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
}

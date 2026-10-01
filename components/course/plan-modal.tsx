"use client";

import Image from "next/image";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { courseLessons } from "@/config/site";

type PlanModalProps = { onOpenChange: (open: boolean) => void; open: boolean };

export function PlanModal({ onOpenChange, open }: PlanModalProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="course-plan-dialog figma-plan-dialog" showCloseButton={false}>
        <picture className="figma-plan-picture">
          <source media="(max-width: 720px)" srcSet="/course/plan-modal-mobile.svg" width="323" height="226" />
          <Image className="figma-plan-artwork" src="/course/plan-modal.svg" alt="" aria-hidden="true" width={1649} height={1150} unoptimized />
        </picture>
        <DialogTitle className="sr-only">План курса</DialogTitle>
        <DialogDescription className="sr-only">Семь последовательных уроков курса «Магия прикосновений».</DialogDescription>
        <ol className="sr-only">{courseLessons.map((lesson) => <li key={lesson.slug}>{Number(lesson.number)} урок — {lesson.short}</li>)}</ol>
        <DialogClose className="figma-plan-close"><span className="sr-only">Продолжить</span></DialogClose>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { courseLessons } from "@/config/site";

type PlanModalProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function PlanModal({ onOpenChange, open }: PlanModalProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="course-plan-dialog" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>План курса</DialogTitle>
          <DialogDescription className="sr-only">
            Семь последовательных уроков курса «Магия прикосновений».
          </DialogDescription>
        </DialogHeader>

        <ol className="course-plan-grid">
          {courseLessons.map((lesson) => (
            <li key={lesson.slug}>
              <strong>{Number(lesson.number)} урок</strong>
              <span>{lesson.short}</span>
            </li>
          ))}
        </ol>

        <DialogClose className="course-plan-continue">Продолжить</DialogClose>
      </DialogContent>
    </Dialog>
  );
}

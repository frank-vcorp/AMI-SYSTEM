/**
 * Modal component stub
 * @package @ami/core-ui
 * FIX REFERENCE: FIX-20260121-01
 * @see context/interconsultas/DICTAMEN_FIX-20260121-01.md
 */
import * as React from "react";
import { cn } from "../lib/utils";

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, children, open, onOpenChange, ...props }, ref) => {
    if (!open) return null;
    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
          className
        )}
        onClick={() => onOpenChange?.(false)}
        {...props}
      >
        <div onClick={(e) => e.stopPropagation()}>{children}</div>
      </div>
    );
  }
);
Modal.displayName = "Modal";

const ModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white rounded-lg shadow-lg p-6 w-full max-w-md",
      className
    )}
    {...props}
  />
));
ModalContent.displayName = "ModalContent";

const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
));
ModalHeader.displayName = "ModalHeader";

const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4",
      className
    )}
    {...props}
  />
));
ModalFooter.displayName = "ModalFooter";

export { Modal, ModalContent, ModalHeader, ModalFooter };

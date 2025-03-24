"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  useId,
  type HTMLAttributes,
  useMemo,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeftIcon, X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import React from "react";

// ===== Sheet Context =====

type SheetInfo = {
  id: string;
  isOpen: boolean;
};

// Sheet Provider Context
interface SheetContextValue {
  sheets: SheetInfo[];
  closeSheet: (id: string) => void;
  openSheet: (id: string) => void;
  isTopSheet: (id: string) => boolean;
  isFirstSheet: (id: string) => boolean;
  baseWidth: number;
  widthIncrement: number;
}

const SheetContext = createContext<SheetContextValue | undefined>(undefined);

// Sheet Instance Context (for the current sheet)
interface SheetInstanceContextValue {
  closeSheet: () => void;
  isTopSheet: () => boolean;
  isFirstSheet: () => boolean;
  currentSheetId: string;
}

const SheetInstanceContext = createContext<
  SheetInstanceContextValue | undefined
>(undefined);

export function SheetProvider({
  children,
  baseWidth = 500,
  widthIncrement = 24,
}: {
  children: ReactNode;
  baseWidth?: number;
  widthIncrement?: number;
}) {
  // State to track all sheets in the stack
  const [sheets, setSheets] = useState<SheetInfo[]>([]);

  const openSheet = useCallback((id: string) => {
    setSheets((prev) => {
      return [...prev, { id, isOpen: true }];
    });
  }, []);

  const closeSheet = useCallback((id: string) => {
    console.log("Closing sheet:", id);
    setSheets((prev) => {
      // Find the sheet that's being closed
      const closingSheet = prev.find((sheet) => sheet.id === id);

      // If the sheet isn't found, just return the current state
      if (!closingSheet) return prev;

      // Mark the sheet as closed but keep it in the array temporarily
      // This allows the exit animation to play
      const sheetsWithClosingMarked = prev.map((sheet) =>
        sheet.id === id ? { ...sheet, isOpen: false } : sheet
      );

      // After the animation duration, actually remove the sheet
      setTimeout(() => {
        setSheets((currentSheets) =>
          currentSheets.filter((sheet) => sheet.id !== id)
        );
      }, 500);

      return sheetsWithClosingMarked;
    });
  }, []);

  const isTopSheet = useCallback(
    (id: string) => {
      // Get only open sheets
      const openSheets = sheets.filter((sheet) => sheet.isOpen);
      if (openSheets.length === 0) return false;

      return openSheets.at(-1)?.id === id;
    },
    [sheets]
  );

  const isFirstSheet = useCallback(
    (id: string) => {
      // Get only open sheets
      const openSheets = sheets.filter((sheet) => sheet.isOpen);

      if (openSheets.length === 0) return false;

      return openSheets[0].id === id;
    },
    [sheets]
  );

  return (
    <SheetContext.Provider
      value={{
        sheets,
        openSheet,
        closeSheet,
        isTopSheet,
        isFirstSheet,
        baseWidth,
        widthIncrement,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
}

// Hook to use the sheet context
export function useSheet() {
  const context = useContext(SheetContext);

  if (!context) {
    throw new Error("useSheet must be used within a SheetProvider");
  }

  return context;
}

// Sheet component
interface StackableSheetProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  trigger?: ReactNode;
  title?: string;
  description?: string;
  side?: "top" | "right" | "bottom" | "left";
  baseWidth?: number;
  widthIncrement?: number;
}

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-500 data-[state=open]:duration-500 max-w-[95vw] transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]",
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        left: "inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

export function StackableSheet({
  children,
  trigger,
  title,
  description,
  side = "right",
  baseWidth: sheetBaseWidth,
  widthIncrement: sheetWidthIncrement,
  className,
  ...props
}: StackableSheetProps) {
  const [open, setOpen] = useState(false);
  const sheetId = useId();

  const {
    openSheet,
    closeSheet,
    isTopSheet,
    isFirstSheet,
    sheets,
    baseWidth: contextBaseWidth,
    widthIncrement: contextWidthIncrement,
  } = useSheet();

  // Add sheet to context when opened
  useEffect(() => {
    if (open) {
      openSheet(sheetId);
    }
  }, [open, openSheet, sheetId]);

  const isTop = isTopSheet(sheetId);

  const openSheets = sheets.filter((sheet) => sheet.isOpen);

  const isFirst = isFirstSheet(sheetId);

  // Use sheet-specific values if provided, otherwise fall back to context values
  const baseWidth =
    sheetBaseWidth !== undefined ? sheetBaseWidth : contextBaseWidth;

  const widthIncrement =
    sheetWidthIncrement !== undefined
      ? sheetWidthIncrement
      : contextWidthIncrement;

  // Calculate width and position based on stack position
  const getSheetStyles = () => {
    // If the sheet is not in the stack, return empty styles
    if (sheets.findIndex((sheet) => sheet.id === sheetId) === -1) {
      return {};
    }

    // Get the current sheet info
    const currentSheet = sheets.find((sheet) => sheet.id === sheetId);
    if (!currentSheet) return {};

    // Check if this sheet is closing
    const isClosing = !currentSheet.isOpen;

    // If this sheet is closing, use special styling
    if (isClosing) {
      const exitProps = {
        transform:
          side === "right"
            ? `translateX(100px) translateZ(0)`
            : `translateX(-100px) translateZ(0)`,
      };

      if (side === "right") {
        return {
          width: `${baseWidth}px`,
          ...exitProps,
        };
      } else {
        return {
          width: `${baseWidth}px`,
          ...exitProps,
        };
      }
    }

    // Find the position of this sheet in the open sheets array
    const positionInOpenSheets = openSheets.findIndex(
      (sheet) => sheet.id === sheetId
    );

    // Calculate the offset to create the visual effect of wider sheets lower in the stack
    // Sheets higher in the stack (lower positionInOpenSheets) have smaller offsets
    // Sheets lower in the stack (higher positionInOpenSheets) have larger offsets
    const reversedPosition = openSheets.length - positionInOpenSheets - 1;
    const offsetAmount = (reversedPosition * widthIncrement) / 2; // Divide by 2 because we offset from both sides

    if (side === "right") {
      return {
        width: `${baseWidth}px`,
        transform: `translateX(-${offsetAmount}px)`,
      };
    } else {
      return {
        width: `${baseWidth}px`,
        transform: `translateX(${offsetAmount}px)`,
      };
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeSheet(sheetId);
    }
    setOpen(isOpen);
  };

  const sheetStyle = getSheetStyles();

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        {isFirst && (
          <Dialog.Overlay className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        )}
        <Dialog.Content
          {...props}
          className={cn(sheetVariants({ side }), className)}
          style={sheetStyle}
          onPointerDownOutside={(e) => {
            // Prevent closing when clicking on another sheet
            if (!isTop) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            // Prevent closing when clicking on another sheet
            if (!isTop) {
              e.preventDefault();
            }
          }}
        >
          {(title || description) && (
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              {title && (
                <Dialog.Title className="text-lg font-semibold text-foreground">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="text-sm text-muted-foreground">
                  {description}
                </Dialog.Description>
              )}
            </div>
          )}

          <div className={cn("py-4")}>{children}</div>

          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            {isFirst ? (
              <X className="size-4" />
            ) : (
              <ArrowLeftIcon className="size-4" />
            )}
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

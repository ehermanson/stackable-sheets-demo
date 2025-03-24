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
import { X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import React from "react";

// ===== Sheet Context =====

type SheetInfo = {
  id: string;
  zIndex: number;
  isOpen: boolean;
};

// Sheet Provider Context
interface SheetContextValue {
  sheets: SheetInfo[];
  addSheet: (sheet: SheetInfo) => void;
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

  // Add a sheet to the stack
  const addSheet = useCallback((sheet: SheetInfo) => {
    setSheets((prev) => {
      // Check if the sheet already exists
      const existingSheet = prev.find((s) => s.id === sheet.id);
      if (existingSheet) {
        // If it exists, just update its isOpen status
        return prev.map((s) =>
          s.id === sheet.id ? { ...s, isOpen: true } : s
        );
      }

      // If it's a new sheet, add it to the array with the highest z-index
      return [...prev, { ...sheet, zIndex: prev.length }];
    });
  }, []);

  const openSheet = useCallback((id: string) => {
    setSheets((prev) => {
      // If sheet is already open, move it to the top
      if (prev.some((sheet) => sheet.id === id)) {
        // Find the highest z-index
        const highestZIndex = prev.reduce(
          (max, sheet) => Math.max(max, sheet.zIndex),
          0
        );

        return prev.map((sheet) =>
          sheet.id === id
            ? { ...sheet, isOpen: true, zIndex: highestZIndex + 1 }
            : sheet
        );
      }

      // Otherwise, add it as a new sheet with the highest z-index
      const highestZIndex = prev.reduce(
        (max, sheet) => Math.max(max, sheet.zIndex),
        0
      );

      return [...prev, { id, isOpen: true, zIndex: highestZIndex + 1 }];
    });
  }, []);

  const closeSheet = useCallback((id: string) => {
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
      }, 500); // Match this with our animation duration

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

      // If no sheets are open, this can't be the first sheet
      if (openSheets.length === 0) return false;

      return openSheets[0].id === id;
    },
    [sheets]
  );

  return (
    <SheetContext.Provider
      value={{
        sheets,
        addSheet,
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
  const instanceContext = useContext(SheetInstanceContext);

  if (!context) {
    throw new Error("useSheet must be used within a SheetProvider");
  }

  // If we're inside a sheet instance context, return the instance-specific methods
  if (instanceContext) {
    return {
      ...context,
      // Override methods with instance-specific versions
      closeSheet: instanceContext.closeSheet,
      isTopSheet: instanceContext.isTopSheet,
      isFirstSheet: instanceContext.isFirstSheet,
      currentSheetId: instanceContext.currentSheetId,
    };
  }

  // Otherwise return the global methods that require IDs
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
    addSheet,
    openSheet: openSheetById,
    closeSheet: closeSheetById,
    isTopSheet: isTopSheetById,
    isFirstSheet: isFirstSheetById,
    sheets,
    baseWidth: contextBaseWidth,
    widthIncrement: contextWidthIncrement,
  } = useSheet();

  // Create instance-specific methods
  const closeSheet = useCallback(() => {
    closeSheetById(sheetId);
  }, [closeSheetById, sheetId]);

  const isTopSheet = useCallback(() => {
    return isTopSheetById(sheetId);
  }, [isTopSheetById, sheetId]);

  const isFirstSheet = useCallback(() => {
    const openSheets = sheets.filter((sheet) => sheet.isOpen);
    const sortedOpenSheets = [...openSheets].sort(
      (a, b) => a.zIndex - b.zIndex
    );
    return sortedOpenSheets.length > 0 && sortedOpenSheets[0].id === sheetId;
  }, [sheets, sheetId]);

  // Create the instance context value
  const instanceContextValue = useMemo(
    () => ({
      closeSheet,
      isTopSheet,
      isFirstSheet,
      currentSheetId: sheetId,
    }),
    [closeSheet, isTopSheet, isFirstSheet, sheetId]
  );

  // Add sheet to context when opened
  useEffect(() => {
    if (open) {
      openSheetById(sheetId);
    }
  }, [open, openSheetById, sheetId]);

  // Calculate stack position
  const stackIndex = sheets.findIndex((sheet) => sheet.id === sheetId);
  const isTop = isTopSheetById(sheetId);

  const openSheets = sheets.filter((sheet) => sheet.isOpen);
  const sortedOpenSheets = [...openSheets].sort((a, b) => a.zIndex - b.zIndex);
  const isFirst =
    sortedOpenSheets.length > 0 && sortedOpenSheets[0].id === sheetId;

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
    if (stackIndex === -1) {
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
        opacity: 0,
      };

      if (side === "right") {
        return {
          width: `${baseWidth}px`, // Use the base width for exiting sheets
          right: 0,
          ...exitProps,
        };
      } else {
        return {
          width: `${baseWidth}px`, // Use the base width for exiting sheets
          left: 0,
          ...exitProps,
        };
      }
    }

    // For open sheets, we need to calculate their position in the stack
    // Get all open sheets sorted by z-index (lowest to highest)
    const openSheets = sheets
      .filter((sheet) => sheet.isOpen)
      .sort((a, b) => a.zIndex - b.zIndex);

    // Find the position of this sheet in the open sheets array
    const positionInOpenSheets = openSheets.findIndex(
      (sheet) => sheet.id === sheetId
    );

    // Calculate the width based on position in the stack
    // The first sheet (lowest z-index) gets the widest width
    // Each subsequent sheet gets narrower by widthIncrement
    const width =
      baseWidth +
      (openSheets.length - positionInOpenSheets - 1) * widthIncrement;

    // Base z-index value - ensure it's higher than the overlay (z-30)
    const baseZIndex = 50;

    // Calculate z-index - sheets higher in the stack have higher z-index
    const calculatedZIndex = baseZIndex + positionInOpenSheets;

    if (side === "right") {
      return {
        width: `${width}px`,
        right: 0,
        zIndex: calculatedZIndex,
      };
    } else {
      return {
        width: `${width}px`,
        left: 0,
        zIndex: calculatedZIndex,
      };
    }
  };

  const sheetStyles = getSheetStyles();

  return (
    <SheetInstanceContext.Provider value={instanceContextValue}>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
        <Dialog.Portal>
          {isFirst && (
            <Dialog.Overlay className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          )}

          <Dialog.Content
            {...props}
            className={cn(
              "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-500 data-[state=open]:duration-500",
              side === "right" &&
                "inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
              side === "left" &&
                "inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
              side === "top" &&
                "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
              side === "bottom" &&
                "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
              "max-w-[95vw] sm:max-w-2xl",
              !isTop && "shadow-lg",
              "transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]",
              className
            )}
            style={{
              ...sheetStyles,
              transition:
                "width 500ms ease, left 500ms ease, right 500ms ease, transform 500ms ease",
            }}
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
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </SheetInstanceContext.Provider>
  );
}

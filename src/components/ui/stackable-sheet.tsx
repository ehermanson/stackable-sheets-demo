import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  useId,
  type HTMLAttributes,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeftIcon, X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

interface SheetInfo {
  id: string;
  isOpen: boolean;
  position: number;
}

interface SheetContextValue {
  sheets: SheetInfo[];
  closeSheet: (id: string) => void;
  openSheet: (id: string) => void;
  isTopSheet: (id: string) => boolean;
  isFirstSheet: (id: string) => boolean;
  baseSize: number;
  stackSpacing: number;
  viewportPadding: number;
}

const SheetContext = createContext<SheetContextValue | undefined>(undefined);

export function SheetProvider({
  children,
  baseSize = 500,
  stackSpacing = 32,
  viewportPadding = 32,
}: {
  children: ReactNode;
  baseSize?: number;
  stackSpacing?: number;
  viewportPadding?: number;
}) {
  const [sheets, setSheets] = useState<SheetInfo[]>([]);

  const openSheet = useCallback((id: string) => {
    setSheets((prev) => {
      const newPosition = prev.length;
      return [...prev, { id, isOpen: true, position: newPosition }];
    });
  }, []);

  const closeSheet = useCallback((id: string) => {
    setSheets((prev) => {
      const sheetsWithClosingMarked = prev.map((sheet) =>
        sheet.id === id ? { ...sheet, isOpen: false } : sheet
      );

      // Remove the sheet after animation
      setTimeout(() => {
        setSheets((currentSheets) =>
          currentSheets.filter((sheet) => sheet.id !== id)
        );
      }, 300); // Default to 300ms, can be overridden by className

      return sheetsWithClosingMarked;
    });
  }, []);

  const isTopSheet = useCallback(
    (id: string) => {
      const openSheets = sheets.filter((sheet) => sheet.isOpen);
      return openSheets.at(-1)?.id === id;
    },
    [sheets]
  );

  const isFirstSheet = useCallback(
    (id: string) => {
      const openSheets = sheets.filter((sheet) => sheet.isOpen);
      return openSheets[0]?.id === id;
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
        baseSize,
        stackSpacing,
        viewportPadding,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
}

export function useSheet() {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("useSheet must be used within a SheetProvider");
  }
  return context;
}

interface StackableSheetProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  trigger?: ReactNode;
  title?: string;
  description?: string;
  side?: "top" | "right" | "bottom" | "left";
  baseSize?: number;
  stackSpacing?: number;
  viewportPadding?: number;
}

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-400 data-[state=open]:duration-400 transition-all duration-400",
  {
    variants: {
      side: {
        right: "max-w-[95vw] inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        left: "max-w-[95vw] inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        top: "inset-x-0 top-0 w-full border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 w-full border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

function getTransformValue(side: StackableSheetProps["side"], offsetAmount: number) {
  switch (side) {
    case "right":
      return `translateX(-${offsetAmount}px)`;
    case "left":
      return `translateX(${offsetAmount}px)`;
    case "top":
      return `translateY(${offsetAmount}px)`;
    case "bottom":
      return `translateY(-${offsetAmount}px)`;
    default:
      return `translateX(-${offsetAmount}px)`;
  }
}

function getMaxOffset(side: StackableSheetProps["side"], baseSize: number, viewportPadding: number): number {
  if (typeof window === "undefined") return 0;

  switch (side) {
    case "right":
      return Math.max(0, window.innerWidth - baseSize - viewportPadding);
    case "left":
      return Math.max(0, window.innerWidth - baseSize - viewportPadding);
    case "top":
      return Math.max(0, window.innerHeight - baseSize - viewportPadding);
    case "bottom":
      return Math.max(0, window.innerHeight - baseSize - viewportPadding);
    default:
      return 0;
  }
}

function getSheetDimensions(
  side: StackableSheetProps["side"], 
  baseSize: number, 
  offsetAmount: number, 
  viewportPadding: number,
  isClosing: boolean = false
) {
  const maxOffset = getMaxOffset(side, baseSize, viewportPadding);
  const clampedOffset = Math.min(offsetAmount, maxOffset);

  // For top/bottom variants, we use height-based stacking
  if (side === "top" || side === "bottom") {
    return {
      width: "100vw",
      height: `${baseSize}px`,
      ...(isClosing ? {} : { transform: getTransformValue(side, clampedOffset) }),
    };
  }

  // For left/right variants, we use width-based stacking
  return {
    width: `${baseSize}px`,
    ...(isClosing ? {} : { transform: getTransformValue(side, clampedOffset) }),
  };
}

export function StackableSheet({
  children,
  trigger,
  title,
  description,
  side = "right",
  baseSize: sheetBaseSize,
  stackSpacing: sheetStackSpacing,
  viewportPadding: sheetViewportPadding,
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
    baseSize: contextBaseSize,
    stackSpacing: contextStackSpacing,
    viewportPadding: contextViewportPadding,
  } = useSheet();

  useEffect(() => {
    if (open) {
      openSheet(sheetId);
    }
  }, [open, openSheet, sheetId]);

  const isTop = isTopSheet(sheetId);
  const isFirst = isFirstSheet(sheetId);
  const openSheets = sheets.filter((sheet) => sheet.isOpen);

  const baseSize = sheetBaseSize ?? contextBaseSize;
  const stackSpacing = sheetStackSpacing ?? contextStackSpacing;
  const viewportPadding = sheetViewportPadding ?? contextViewportPadding;

  const getSheetStyles = () => {
    const currentSheet = sheets.find((sheet) => sheet.id === sheetId);
    if (!currentSheet) return {};

    const isClosing = !currentSheet.isOpen;
    const positionInOpenSheets = openSheets.findIndex(
      (sheet) => sheet.id === sheetId
    );
    const reversedPosition = openSheets.length - positionInOpenSheets - 1;
    const offsetAmount = reversedPosition * stackSpacing;

    return getSheetDimensions(side, baseSize, offsetAmount, viewportPadding, isClosing);
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
          <Dialog.Overlay 
            className={cn(
              "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "transition-all duration-400"
            )}
          />
        )}
        <Dialog.Content
          {...props}
          className={cn(sheetVariants({ side }), className)}
          style={sheetStyle}
          onPointerDownOutside={(e) => {
            if (!isTop) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
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
            {isFirst ? <X className="size-4" /> : <ArrowLeftIcon className="size-4" />}
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

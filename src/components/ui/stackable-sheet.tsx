import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
  useId,
} from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

interface SheetInfo {
  id: string;
  isOpen: boolean;
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

function StackableSheetProvider({
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
      return [...prev, { id, isOpen: true }];
    });
  }, []);

  const closeSheet = useCallback((id: string) => {
    setSheets((prev) => {
      const sheetsWithClosingMarked = prev.map((sheet) =>
        sheet.id === id ? { ...sheet, isOpen: false } : sheet
      );

      setTimeout(() => {
        setSheets((currentSheets) =>
          currentSheets.filter((sheet) => sheet.id !== id)
        );
      }, 300);

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

function useSheetContext() {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("useSheetContext must be used within a SheetProvider");
  }
  return context;
}

interface StackableSheetProps extends DialogPrimitive.DialogContentProps {
  trigger?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  baseSize?: number;
  stackSpacing?: number;
  viewportPadding?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CurrentSheetContextValue {
  id: string;
  isOpen: boolean;
  isTop: boolean;
  isFirst: boolean;
  close: () => void;
}

const CurrentSheetContext = createContext<CurrentSheetContextValue | undefined>(
  undefined
);

const sheetVariants = cva(
  [
    "flex flex-col fixed z-50 bg-background border rounded-xl shadow-lg",
    "transition-[transform,opacity] ease-in-out duration-400",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:duration-400 data-[state=open]:duration-400",
    "will-change-transform will-change-opacity",
    "w-[var(--sheet-width)]",
    "h-[var(--sheet-height)]",
    "opacity-[var(--sheet-opacity)]",
    "transform-[var(--sheet-transform-offset)_scale(var(--sheet-scale))]",
    "transform-origin-[var(--sheet-transform-origin)",
  ].join(" "),
  {
    variants: {
      side: {
        right: [
          "max-w-[95dvw] right-0 top-[8px] bottom-[8px]",
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        ].join(" "),
        left: [
          "max-w-[95dvw] left-0 top-[8px] bottom-[8px]",
          "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        ].join(" "),
        top: [
          "max-h-[95dvh] top-0 left-[8px] right-[8px]",
          "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        ].join(" "),
        bottom: [
          "max-h-[95dvh] bottom-0 left-[8px] right-[8px]",
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        ].join(" "),
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

interface CSSCustomProperties extends React.CSSProperties {
  [key: `--${string}`]: string | number;
}

function getTransformValue({
  side,
  offsetAmount,
  gap,
}: {
  side: StackableSheetProps["side"];
  offsetAmount: number;
  gap: number;
}) {
  switch (side) {
    case "right":
      return `translateX(calc(-${offsetAmount}px - ${gap}px))`;
    case "left":
      return `translateX(calc(${offsetAmount}px + ${gap}px))`;
    case "top":
      return `translateY(calc(${offsetAmount}px + ${gap}px))`;
    case "bottom":
      return `translateY(calc(-${offsetAmount}px - ${gap}px))`;
    default:
      return `translateX(calc(-${offsetAmount}px - ${gap}px))`;
  }
}

function getMaxOffset({
  side,
  baseSize,
  viewportPadding,
  gap,
}: {
  side: StackableSheetProps["side"];
  baseSize: number;
  viewportPadding: number;
  gap: number;
}) {
  if (typeof window === "undefined") return 0;

  const effectivePadding = viewportPadding + gap;

  switch (side) {
    case "right":
    case "left":
      return Math.max(0, window.innerWidth - baseSize - effectivePadding);
    case "top":
    case "bottom":
      return Math.max(0, window.innerHeight - baseSize - effectivePadding);
    default:
      return 0;
  }
}

function calculateCssVars({
  side,
  baseSize,
  offsetAmount,
  viewportPadding,
  isClosing = false,
  scale = 1,
  opacity = 1,
}: {
  side: StackableSheetProps["side"];
  baseSize: number;
  offsetAmount: number;
  viewportPadding: number;
  isClosing?: boolean;
  scale?: number;
  opacity?: number;
}): CSSCustomProperties {
  const gapFromWindowEdges = 8;
  const maxOffset = getMaxOffset({
    side,
    baseSize,
    viewportPadding,
    gap: gapFromWindowEdges,
  });
  const clampedOffset = Math.min(offsetAmount, maxOffset);

  const cssProps: CSSCustomProperties = {
    "--sheet-opacity": isClosing ? 1 : opacity,
    "--sheet-scale": isClosing ? 1 : scale.toString(),
    "--sheet-transform-offset": getTransformValue({
      side,
      offsetAmount: isClosing ? 0 : clampedOffset,
      gap: gapFromWindowEdges,
    }),
  };

  if (side === "right") {
    cssProps["--sheet-transform-origin"] = "right center";
  } else if (side === "left") {
    cssProps["--sheet-transform-origin"] = "left center";
  } else if (side === "top") {
    cssProps["--sheet-transform-origin"] = "top center";
  } else if (side === "bottom") {
    cssProps["--sheet-transform-origin"] = "bottom center";
  }

  // Set width and height based on the side
  // For top/bottom sheets, width is full viewport width minus gaps, height is fixed baseSize
  // For left/right sheets, width is fixed baseSize, height is full viewport height minus gaps
  if (side === "top" || side === "bottom") {
    cssProps["--sheet-width"] = `calc(100dvw - ${gapFromWindowEdges * 2}px)`;
    cssProps["--sheet-height"] = `${baseSize}px`;
  } else {
    cssProps["--sheet-width"] = `${baseSize}px`;
    cssProps["--sheet-height"] = `calc(100dvh - ${gapFromWindowEdges * 2}px)`;
  }

  return cssProps;
}

function StackableSheet({
  children,
  trigger,
  side = "right",
  baseSize: sheetBaseSize,
  stackSpacing: sheetStackSpacing,
  viewportPadding: sheetViewportPadding,
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  ...props
}: StackableSheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const sheetId = useId();

  // Use controlled state if provided, otherwise use uncontrolled
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setUncontrolledOpen;

  const {
    openSheet,
    closeSheet,
    isTopSheet,
    isFirstSheet,
    sheets,
    baseSize: contextBaseSize,
    stackSpacing: contextStackSpacing,
    viewportPadding: contextViewportPadding,
  } = useSheetContext();

  useEffect(() => {
    if (open) {
      openSheet(sheetId);
    }
  }, [open, openSheet, sheetId]);

  const isTop = isTopSheet(sheetId);
  const isFirst = isFirstSheet(sheetId);

  const baseSize = sheetBaseSize ?? contextBaseSize;
  const stackSpacing = sheetStackSpacing ?? contextStackSpacing;
  const viewportPadding = sheetViewportPadding ?? contextViewportPadding;

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        closeSheet(sheetId);
      }
      setOpen?.(isOpen);
    },
    [closeSheet, sheetId, setOpen]
  );

  const cssVars = useMemo(() => {
    const currentSheet = sheets.find((sheet) => sheet.id === sheetId);
    if (!currentSheet) return {};

    const isClosing = !currentSheet.isOpen;

    const openSheets = sheets.filter((sheet) => sheet.isOpen);

    // Find this sheet's position in the stack
    const positionInOpenSheets = openSheets.findIndex(
      (sheet) => sheet.id === sheetId
    );

    // Reverse the position to calculate visual stacking
    // Higher reversedPosition = further back in the stack
    const reversedPosition = openSheets.length - positionInOpenSheets - 1;

    // Limit maximum positions for offset and scale for consistent appearance
    const MAX_OFFSET_POSITION = 4;
    const MAX_SCALE_POSITION = 4;

    // Calculate offset based on position in stack
    const effectiveOffsetPosition = Math.min(
      reversedPosition,
      MAX_OFFSET_POSITION
    );
    const offsetAmount = effectiveOffsetPosition * stackSpacing;

    // Calculate scale based on position in stack (sheets further back are slightly smaller, up to a point)
    const effectiveScalePosition = Math.min(
      reversedPosition,
      MAX_SCALE_POSITION
    );
    const scale = Math.max(1 - effectiveScalePosition * 0.02, 0.9);

    // Calculate opacity based on position in stack.
    // This is a very subtle effect, we only reduce opacity by 2% per position, with a minimum of 85% opacity.
    const opacity = Math.max(1 - reversedPosition * 0.02, 0.85);

    return calculateCssVars({
      side,
      baseSize,
      offsetAmount,
      viewportPadding,
      isClosing,
      scale,
      opacity,
    });
  }, [sheets, sheetId, stackSpacing, side, baseSize, viewportPadding]);

  const currentSheetValue = useMemo(
    () => ({
      id: sheetId,
      isOpen: open,
      isTop,
      isFirst,
      close: () => handleOpenChange(false),
    }),
    [sheetId, open, isTop, isFirst, handleOpenChange]
  );

  return (
    <CurrentSheetContext.Provider value={currentSheetValue}>
      <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        {trigger && (
          <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
        )}
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className={cn(
              "fixed inset-0 z-30",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "transition-all duration-400",
              {
                "bg-black/50 backdrop-blur-sm": isFirst,
              }
            )}
          />
          <DialogPrimitive.Content
            {...props}
            className={cn(
              sheetVariants({ side }),
              className
            )}
            style={cssVars}
          >
            {children}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </CurrentSheetContext.Provider>
  );
}

function useSheet() {
  const context = useContext(CurrentSheetContext);
  if (!context) {
    throw new Error("useSheet must be used within a StackableSheet");
  }
  return context;
}

function StackableSheetHeader({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

function StackableSheetBody({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex-1 min-h-0 overflow-y-auto px-6 pb-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function StackableSheetFooter({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("mt-auto px-6", className)} {...props}>
      {children}
    </div>
  );
}

function StackableSheetClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />;
}

function StackableSheetTitle({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Title>
  );
}

function StackableSheetDescription({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Description>
  );
}

function StackableSheetDefaultHeader({
  title,
  description,
}: {
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <StackableSheetHeader className="flex items-start border-b">
      <div>
        <StackableSheetTitle>{title}</StackableSheetTitle>
        <StackableSheetDescription>{description}</StackableSheetDescription>
      </div>
      <StackableSheetClose className="ml-auto">
        <X className="size-4" />
        <span className="sr-only">Close</span>
      </StackableSheetClose>
    </StackableSheetHeader>
  );
}

export {
  useSheet,
  StackableSheetProvider,
  StackableSheet,
  StackableSheetHeader,
  StackableSheetBody,
  StackableSheetFooter,
  StackableSheetClose,
  StackableSheetTitle,
  StackableSheetDescription,
  StackableSheetDefaultHeader,
};

import { Button } from "@/components/ui/button";
import { StackableSheet, useSheet } from "@/components/ui/stackable-sheet";

interface DemoSheetProps {
  level: number;
  side: "left" | "right";
  baseSize?: number;
  stackSpacing?: number;
  title?: string;
  description?: string;
}

export function DemoSheet({
  level,
  side,
  baseSize,
  stackSpacing,
  title = `Level ${level} Sheet`,
  description = `This is a level ${level} sheet in the stack`,
}: DemoSheetProps) {
  const sheet = useSheet();

  return (
    <StackableSheet
      trigger={
        <Button variant={level === 1 ? "default" : "outline"}>
          Open {title}
        </Button>
      }
      title={title}
      description={description}
      side={side}
      baseSize={baseSize}
      stackSpacing={stackSpacing}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Sheet Content</h3>
          <p>
            This is the content for level {level} sheet. You can add any content
            here.
          </p>
          {level === 1 && (
            <p className="text-sm text-muted-foreground">
              This is the first level sheet. Try opening the next level to see
              how sheets stack.
            </p>
          )}
        </div>

        <DemoSheet level={level + 1} side={side} stackSpacing={stackSpacing} />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            if (sheet && typeof sheet.closeSheet === "function") {
              // Get the sheet ID from the instance context
              const sheetId = `demo-sheet-${level}`;
              sheet.closeSheet(sheetId);
            }
          }}
        >
          Close This Sheet
        </Button>
      </div>
    </StackableSheet>
  );
}

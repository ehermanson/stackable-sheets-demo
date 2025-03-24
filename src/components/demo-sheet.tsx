import { Button } from "@/components/ui/button";
import { 
  StackableSheet, 
  StackableSheetHeader, 
  StackableSheetContent, 
  StackableSheetFooter,
  StackableSheetClose,
  useSheet
} from "@/components/ui/stackable-sheet";
import * as Dialog from "@radix-ui/react-dialog";

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
  return (
    <StackableSheet
      trigger={
        <Button variant={level === 1 ? "default" : "outline"}>
          Open {title}
        </Button>
      }
      side={side}
      baseSize={baseSize}
      stackSpacing={stackSpacing}
    >
      <DemoSheetContent 
        level={level} 
        side={side} 
        stackSpacing={stackSpacing}
        title={title}
        description={description}
      />
    </StackableSheet>
  );
}

function DemoSheetContent({
  level,
  side,
  stackSpacing,
  title,
  description,
}: DemoSheetProps) {
  const { close, isFirst } = useSheet();

  return (
    <>
      <StackableSheetHeader>
        <Dialog.Title className="text-lg font-semibold text-foreground">
          {title}
        </Dialog.Title>
        <Dialog.Description className="text-sm text-muted-foreground">
          {description}
        </Dialog.Description>
      </StackableSheetHeader>

      <StackableSheetContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Sheet Content</h3>
            <p>
              This is the content for level {level} sheet. You can add any content
              here.
            </p>
            {isFirst && (
              <p className="text-sm text-muted-foreground">
                This is the first level sheet. Try opening the next level to see
                how sheets stack.
              </p>
            )}
          </div>

          <DemoSheet level={level + 1} side={side} stackSpacing={stackSpacing} />
        </div>
      </StackableSheetContent>

      <StackableSheetFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={close}
        >
          Close This Sheet
        </Button>
      </StackableSheetFooter>

      <StackableSheetClose />
    </>
  );
}

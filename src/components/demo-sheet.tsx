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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Card, CardContent } from "./ui/card";

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
        <Button>
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
        baseSize={baseSize}
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
  baseSize,
  stackSpacing,
  title,
  description,
}: DemoSheetProps) {
  const { close, isFirst } = useSheet();

  const content = {
    paragraphs: generateRandomParagraphs(2, 4),
    cards: generateRandomCards(4, 8),
  };

  return (
    <>
      <StackableSheetHeader className="border-b">
        <Dialog.Title className="text-lg font-semibold text-foreground">
          {title}
        </Dialog.Title>
        <Dialog.Description className="text-sm text-muted-foreground">
          {description}
        </Dialog.Description>
      </StackableSheetHeader>

      <StackableSheetContent>
        <div className="space-y-6 pt-4">
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

          <DemoSheet
            level={level + 1}
            side={side}
            baseSize={baseSize}
            stackSpacing={stackSpacing}
          />
        </div>

        {/* Form Section */}
        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter your name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="type1">Type 1</SelectItem>
                <SelectItem value="type2">Type 2</SelectItem>
                <SelectItem value="type3">Type 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center items-center gap-4">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full max-w-sm"
          >
            <CarouselContent>
              {Array.from({ length: 10 }).map((_, index) => (
                <CarouselItem key={index} className="sm:basis-1/2 md:basis-1/3">
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <span className="text-3xl font-semibold">{index + 1}</span>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Text Content */}
        <div className="mt-8 space-y-4">
          <h3 className="font-semibold">Additional Information</h3>
          {content.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-sm text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {content.cards.map((card, index) => (
            <Card key={index}>
              <CardContent>
                <h4 className="text-lg font-semibold">{card.title}</h4>
              </CardContent>
            </Card>
          ))}
        </div>

      </StackableSheetContent>

      <StackableSheetFooter className="border-t py-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={close}
        >
          Close Sheet
        </Button>
      </StackableSheetFooter>
      <StackableSheetClose />
    </>
  );
}


function generateRandomParagraphs(min: number = 2, max: number = 8): string[] {
  const paragraphs = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  ];

  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length: count }, () =>
    paragraphs[Math.floor(Math.random() * paragraphs.length)]
  );
}

function generateRandomCards(min: number = 1, max: number = 4): Array<{ title: string; content: string }> {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length: count }, (_, i) => ({
    title: `Card ${i + 1}`,
    content: generateRandomParagraphs(1, 4)[0],
  }));
}

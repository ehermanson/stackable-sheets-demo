import { Button } from "@/components/ui/button";
import {
  StackableSheet,
  StackableSheetHeader,
  StackableSheetBody,
  StackableSheetFooter,
  StackableSheetClose,
  StackableSheetTitle,
  StackableSheetDescription,
  StackableSheetDefaultHeader,
  useSheet,
} from "@/components/ui/stackable-sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Card, CardContent } from "./ui/card";
import { useMemo } from "react";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface DemoSheetProps {
  level: number;
  side: "left" | "right";
  baseSize?: number;
  stackSpacing?: number;
  title?: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
}

interface DemoContent {
  layout: "simple" | "form" | "cards" | "carousel" | "mixed";
  paragraphs: string[];
  cards: Array<{ title: string; content: string }>;
}

export function DemoSheet({
  level,
  side,
  baseSize,
  stackSpacing,
  title = `Sheet ${level}`,
  description = `This is sheet ${level} in the stack`,
  open,
  onOpenChange,
  trigger,
}: DemoSheetProps) {
  return (
    <StackableSheet
      trigger={trigger}
      side={side}
      baseSize={baseSize}
      stackSpacing={stackSpacing}
      open={open}
      onOpenChange={onOpenChange}
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

  const content = useMemo<DemoContent>(
    () => ({
      layout: getRandomLayout(),
      paragraphs: generateRandomParagraphs(4, 10),
      cards: generateRandomCards(8, 12),
    }),
    []
  );

  return (
    <>
      {isFirst ? (
        <StackableSheetDefaultHeader
          title={title ?? "Sheet Title"}
          description={description ?? "Sheet Description"}
        />
      ) : (
        <StackableSheetHeader className="border-b flex items-start">
          <>
            <div>
              <StackableSheetTitle>{title}</StackableSheetTitle>
              <StackableSheetDescription>
                {description}. Composed header w/ custom close button.
              </StackableSheetDescription>
            </div>
            <StackableSheetClose className="ml-auto">
              <ArrowLeft className="size-4" />
            </StackableSheetClose>
          </>
        </StackableSheetHeader>
      )}

      <StackableSheetBody>
        <div className="space-y-6 pt-4 mb-10">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Sheet Content</h3>
            <p>
              This is the content for sheet {level}.
            </p>

            {isFirst && (
              <p>
                This is the first level sheet. Try opening the next level to see
                how sheets stack.
              </p>
            )}
          </div>
          <div>
            <Input
              type="text"
              placeholder='Type "close" to close this sheet programmatically'
              onChange={(e) => {
                if (e.target.value === "close") {
                  close();
                }
              }}
            />
          </div>
          <DemoSheet
            level={level + 1}
            side={side}
            baseSize={baseSize}
            stackSpacing={stackSpacing}
            trigger={<Button>Another One</Button>}
          />
        </div>
        <h3 className="text-lg font-medium">Random Content</h3>
        {content.layout === "form" && <FormLayout />}
        {content.layout === "cards" && <CardsLayout cards={content.cards} />}
        {content.layout === "carousel" && <CarouselLayout />}
        {content.layout === "mixed" && (
          <>
            <FormLayout />
            <CardsLayout cards={content.cards.slice(0, 2)} />
          </>
        )}
        {content.layout === "simple" && (
          <SimpleLayout paragraphs={content.paragraphs} />
        )}
      </StackableSheetBody>

      <StackableSheetFooter className="border-t py-4">
        <div className="text-sm text-muted-foreground mb-2 text-center">
          Compose the <code>StackableSheetClose</code> component to close the
          current sheet.
        </div>
        <StackableSheetClose asChild>
          <Button className="w-full">Close Sheet</Button>
        </StackableSheetClose>
      </StackableSheetFooter>
    </>
  );
}

function FormLayout() {
  return (
    <div className="mt-8 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Enter your name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Category</Label>
        <Select>
          <SelectTrigger id="type">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="category1">Category 1</SelectItem>
            <SelectItem value="category2">Category 2</SelectItem>
            <SelectItem value="category3">Category 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function CardsLayout({
  cards,
}: {
  cards: Array<{ title: string; content: string }>;
}) {
  return (
    <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <h4 className="text-lg font-semibold mb-2">{card.title}</h4>
            <p className="text-sm text-muted-foreground">{card.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CarouselLayout() {
  return (
    <div className="mt-8 px-12">
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
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
  );
}

function SimpleLayout({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="mt-8 space-y-6">
      <h3 className="font-semibold">Additional Information</h3>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-sm text-muted-foreground">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function getRandomLayout(): DemoContent["layout"] {
  const layouts: DemoContent["layout"][] = [
    "simple",
    "form",
    "cards",
    "carousel",
    "mixed",
  ];
  return layouts[Math.floor(Math.random() * layouts.length)];
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
  return Array.from(
    { length: count },
    () => paragraphs[Math.floor(Math.random() * paragraphs.length)]
  );
}

function generateRandomCards(
  min: number = 1,
  max: number = 4
): Array<{ title: string; content: string }> {
  const titles = [
    "Product Overview",
    "User Statistics",
    "Recent Activity",
    "System Status",
    "Performance Metrics",
    "Team Updates",
    "Project Timeline",
    "Resource Usage",
  ];

  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return Array.from({ length: count }, () => ({
    title: titles[Math.floor(Math.random() * titles.length)],
    content: generateRandomParagraphs(1, 1)[0],
  }));
}

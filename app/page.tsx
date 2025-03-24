"use client";
import { useState } from "react";
import { SheetProvider } from "@/components/ui/stackable-sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { DemoSheet } from "@/components/demo-sheet";

export default function Home() {
  // Sheet configuration state
  const [side, setSide] = useState<"left" | "right">("right");
  const [baseWidth, setBaseWidth] = useState(500);
  const [widthIncrement, setWidthIncrement] = useState(24);
  const [maxLevel, setMaxLevel] = useState(5);

  return (
    <SheetProvider baseWidth={baseWidth} widthIncrement={widthIncrement}>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Stackable Sheets Demo</h1>

        {/* Control Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Side Selection */}
              <div className="space-y-3">
                <Label className="text-base">Sheet Position</Label>
                <RadioGroup
                  defaultValue={side}
                  onValueChange={(value: string) =>
                    setSide(value as "left" | "right")
                  }
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="left" id="left" />
                    <Label htmlFor="left">Left</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="right" id="right" />
                    <Label htmlFor="right">Right</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Base Width */}
              <div className="space-y-3">
                <Label className="text-base">Base Width: {baseWidth}px</Label>
                <Slider
                  defaultValue={[baseWidth]}
                  min={300}
                  max={1500}
                  step={1}
                  onValueChange={(value: number[]) => setBaseWidth(value[0])}
                  className="w-full"
                />
              </div>

              {/* Width Increment */}
              <div className="space-y-3">
                <Label className="text-base">
                  Width Increment: {widthIncrement}px
                </Label>
                <Slider
                  defaultValue={[widthIncrement]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={(value: number[]) =>
                    setWidthIncrement(value[0])
                  }
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4">Demo</h2>
        <p className="text-muted-foreground mb-4">
          This example uses a recursive component to create up to {maxLevel}{" "}
          levels of sheets.
        </p>
        <DemoSheet level={1} maxLevel={maxLevel} side={side} />
      </div>
    </SheetProvider>
  );
}

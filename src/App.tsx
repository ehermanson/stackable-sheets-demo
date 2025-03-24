import { useState } from "react";
import { SheetProvider } from "@/components/ui/stackable-sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { DemoSheet } from "@/components/demo-sheet";

export default function App() {
  const [side, setSide] = useState<"left" | "right">("right");
  const [baseSize, setBaseSize] = useState(750);
  const [stackSpacing, setStackSpacing] = useState(32);

  return (
    <SheetProvider baseSize={baseSize} stackSpacing={stackSpacing}>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Stackable Sheets Demo</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="top" id="top" />
                    <Label htmlFor="top">Top</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom" id="bottom" />
                    <Label htmlFor="bottom">Bottom</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Base Size: {baseSize}px</Label>
                <Slider
                  defaultValue={[baseSize]}
                  min={300}
                  max={1500}
                  step={1}
                  onValueChange={(value: number[]) => setBaseSize(value[0])}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base">
                  Stack Spacing: {stackSpacing}px
                </Label>
                <Slider
                  defaultValue={[stackSpacing]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={(value: number[]) => setStackSpacing(value[0])}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4">Demo</h2>
        <p className="text-muted-foreground mb-4">
          This example uses a recursive component to create stackable sheets.
        </p>
        <DemoSheet level={1} side={side} />
      </div>
    </SheetProvider>
  );
}

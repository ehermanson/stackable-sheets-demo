# Stackable Sheets

Pretty much the shadcn/ui `sheet` component, but stackable.

Demo: https://stackable-sheets-demo.pages.dev/ 

## Usage

1. Copy and paste `stackable-sheet.tsx`.
2. Install any dependencies you don't have. If you're already using shadcn, you probably have them all already.
3. Add the `StackableSheetProvider` somewhere near the root of your app:

```tsx
import { StackableSheetProvider } from "@/components/ui/stackable-sheet";

function App() {
  return (
    <StackableSheetProvider>{/* Your app content */}</StackableSheetProvider>
  );
}
```

4. Use the `StackableSheet` component:

```tsx
import {
  StackableSheet,
  StackableSheetDefaultHeader,
  StackableSheetBody,
} from "@/components/ui/stackable-sheet";

function MySheet() {
  return (
    <StackableSheet trigger={<button>Open Sheet</button>}>
      <StackableSheetDefaultHeader
        title="Sheet Title"
        description="Sheet description"
      />
      <StackableSheetBody>{/* Your sheet content */}</StackableSheetBody>
    </StackableSheet>
  );
}
```

If you need to open a sheet programatically, omit the trigger:

```tsx
import {
  StackableSheet,
  StackableSheetDefaultHeader,
  StackableSheetBody,
} from "@/components/ui/stackable-sheet";
import { useState } from "react";

function ControlledSheet() {
  const [open, setOpen] = useState();

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open the Sheet</Button>
      <StackableSheet open={open} onOpenChange={setOpen}>
        <StackableSheetDefaultHeader
          title="Sheet Title"
          description="Sheet description"
        />
        <StackableSheetBody>{/* Your sheet content */}</StackableSheetBody>
      </StackableSheet>
    </div>
  );
}
```

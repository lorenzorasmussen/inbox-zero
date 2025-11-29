---
description: "Create UI components with Shadcn UI, Tailwind CSS, and responsive design"
agent: build
subtask: true
---

# 🎨 UI Component Generator

Create React components following Inbox Zero UI patterns, Shadcn UI integration, and responsive design.

## Phase 1: Component Type Selection

**What type of component are you creating?**

- `form` - Form components with validation
- `table` - Data tables with sorting/filtering
- `card` - Card components for content display
- `modal` - Modal/dialog components
- `chart` - Data visualization components
- `layout` - Layout and wrapper components
- `list` - List components with items
- `button` - Custom button components
- `input` - Custom input components
- `navigation` - Navigation components

**User provided:** $1

## Phase 2: Component Configuration

**Component Details:**

- **Component Name:** $2 (PascalCase, e.g., `UserProfile`, `EmailTable`, `RuleForm`)
- **Description:** $3 (optional description of component purpose)
- **Props:** $4 (comma-separated prop names and types, e.g., `data:array,onSelect:function`)

**Generated Files:**

- `apps/web/components/COMPONENT_NAME.tsx` - Main component file
- `apps/web/components/COMPONENT_NAME.test.tsx` - Test file
- `apps/web/components/ui/COMPONENT_PART.tsx` (if using Shadcn parts)

## Phase 3: Component Structure Template

### Basic Component Structure

```typescript
// apps/web/components/COMPONENT_NAME.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LoadingContent } from "@/components/LoadingContent";

interface ComponentNameProps {
  // Generated props
  className?: string;
  children?: React.ReactNode;
}

export function ComponentName({
  // Props destructuring
  className,
  children,
  ...props
}: ComponentNameProps) {
  return (
    <div className={cn("default-styles", className)} {...props}>
      {/* Component content */}
    </div>
  );
}
```

### Form Component Structure

```typescript
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers";
import { toastError, toastSuccess } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingContent } from "@/components/LoadingContent";
import { actionNameAction } from "@/utils/actions/ACTION_NAME";

interface ComponentNameFormProps {
  initialData?: Partial<FormData>;
  onSubmit?: (data: FormData) => void;
  onCancel?: () => void;
}

export function ComponentNameForm({
  initialData,
  onSubmit,
  onCancel
}: ComponentNameFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(actionNameBody),
    defaultValues: initialData
  });

  const onFormSubmit = async (data: FormData) => {
    try {
      const result = await actionNameAction(data);

      if (result?.serverError) {
        toastError({
          title: "Error",
          description: result.serverError
        });
      } else {
        toastSuccess({
          description: "Saved successfully"
        });
        onSubmit?.(result);
      }
    } catch (error) {
      toastError({
        title: "Unexpected error",
        description: error.message
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Form fields */}
      <div className="flex gap-2 pt-4">
        <Button type="submit">Save</Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
```

### Table Component Structure

```typescript
"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LoadingContent } from "@/components/LoadingContent";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

interface ComponentNameTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
  className?: string;
}

export function ComponentNameTable<T>({
  data,
  columns,
  loading,
  onRowClick,
  onSort,
  className
}: ComponentNameTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    onSort?.(column, sortDirection);
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)}>
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(column.key)}
                    className="font-semibold"
                  >
                    {column.label}
                    {sortColumn === column.key && (
                      <span className="ml-2">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Button>
                ) : (
                  column.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <LoadingContent loading={loading} error={null}>
            {sortedData.map((item, index) => (
              <TableRow
                key={index}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </LoadingContent>
        </TableBody>
      </Table>
    </div>
  );
}
```

### Card Component Structure

```typescript
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ComponentNameCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export function ComponentNameCard({
  title,
  description,
  children,
  actions,
  className,
  variant = "default"
}: ComponentNameCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      {(title || description || actions) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

## Phase 4: Shadcn UI Integration

### Install New Shadcn Components

```bash
# Install component
pnpm dlx shadcn@latest add COMPONENT_NAME

# Examples:
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add chart
```

### Custom Component with Shadcn Parts

```typescript
"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomDialogProps {
  trigger: React.ReactNode;
  title: string;
  onConfirm?: (data: FormData) => void;
  children?: React.ReactNode;
}

export function CustomDialog({ trigger, title, onConfirm, children }: CustomDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({});

  const handleConfirm = () => {
    onConfirm?.(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {children || (
            <div className="space-y-2">
              <Label htmlFor="field1">Field 1</Label>
              <Input
                id="field1"
                value={formData.field1 || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, field1: e.target.value }))}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Phase 5: Responsive Design Patterns

### Mobile-First Approach

```typescript
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveComponentProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveComponent({ children, className }: ResponsiveComponentProps) {
  return (
    <div className={cn(
      // Mobile-first base styles
      "w-full px-4 py-2",

      // Small screens and up
      "sm:px-6 sm:py-3",

      // Medium screens and up
      "md:px-8 md:py-4",

      // Large screens and up
      "lg:px-12 lg:py-6",

      className
    )}>
      {children}
    </div>
  );
}
```

### Grid Layouts

```typescript
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GridComponentProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string;
  className?: string;
}

export function GridComponent({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "gap-4",
  className
}: GridComponentProps) {
  return (
    <div className={cn(
      "grid",
      `grid-cols-${cols.mobile}`,
      `md:grid-cols-${cols.tablet}`,
      `lg:grid-cols-${cols.desktop}`,
      gap,
      className
    )}>
      {children}
    </div>
  );
}
```

## Phase 6: Data Fetching Integration

### SWR Integration

```typescript
"use client";

import React from "react";
import useSWR from "swr";
import { LoadingContent } from "@/components/LoadingContent";
import { ComponentNameTable } from "./ComponentNameTable";

interface DataComponentProps {
  apiUrl: string;
  refreshInterval?: number;
}

export function DataComponent({ apiUrl, refreshInterval }: DataComponentProps) {
  const { data, isLoading, error, mutate } = useSWR(apiUrl, {
    refreshInterval
  });

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "createdAt", label: "Created", sortable: true }
  ];

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Error loading data: {error.message}
      </div>
    );
  }

  return (
    <LoadingContent loading={isLoading} error={null}>
      {data && (
        <ComponentNameTable
          data={data}
          columns={columns}
          onRowClick={(item) => console.log("Row clicked:", item)}
        />
      )}
    </LoadingContent>
  );
}
```

### Server Component Data Loading

```typescript
// Server component for initial data load
import { prisma } from "@/utils/prisma";
import { ComponentNameClient } from "./ComponentNameClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ComponentNamePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { page } = await searchParams;

  const data = await prisma.resource.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    skip: (parseInt(page || "1") - 1) * 20
  });

  return <ComponentNameClient initialData={data} />;
}
```

## Phase 7: Testing Setup

### Component Tests

```typescript
// apps/web/components/COMPONENT_NAME.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ComponentName } from "./COMPONENT_NAME";

describe("ComponentName", () => {
  it("renders correctly with default props", () => {
    render(<ComponentName />);

    expect(screen.getByRole("heading")).toHaveTextContent("Default Title");
  });

  it("handles user interactions", async () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  it("displays loading state", () => {
    render(<ComponentName loading={true} />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("shows error state", () => {
    render(<ComponentName error="Something went wrong" />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
```

### Accessibility Tests

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { ComponentName } from "./COMPONENT_NAME";

describe("ComponentName Accessibility", () => {
  it("should not have accessibility violations", async () => {
    const { container } = render(<ComponentName />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it("should be keyboard navigable", () => {
    render(<ComponentName />);

    const button = screen.getByRole("button");
    button.focus();
    expect(button).toHaveFocus();

    fireEvent.keyDown(button, { key: "Enter" });
    // Test Enter key functionality
  });
});
```

## Phase 8: Component Generation

### Form Component Template

```typescript
// Generated form component
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers";
import { toastError, toastSuccess } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingContent } from "@/components/LoadingContent";
import { actionNameAction } from "@/utils/actions/ACTION_NAME";
import { cn } from "@/lib/utils";

interface ComponentNameFormProps {
  initialData?: Partial<FormData>;
  onSubmit?: (data: FormData) => void;
  onCancel?: () => void;
  className?: string;
}

export function ComponentNameForm({
  initialData,
  onSubmit,
  onCancel,
  className
}: ComponentNameFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(actionNameBody),
    defaultValues: initialData
  });

  const onFormSubmit = async (data: FormData) => {
    try {
      const result = await actionNameAction(data);

      if (result?.serverError) {
        toastError({
          title: "Error",
          description: result.serverError
        });
      } else {
        toastSuccess({
          description: "Saved successfully"
        });
        onSubmit?.(result);
      }
    } catch (error) {
      toastError({
        title: "Unexpected error",
        description: error.message
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={cn("space-y-4", className)}>
      {/* Generated form fields based on props */}
      <div className="flex gap-2 pt-4">
        <Button type="submit">Save</Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
```

## Phase 9: Style Guidelines

### Tailwind CSS Patterns

```typescript
// Consistent spacing
const spacing = {
  xs: "p-2 m-1",
  sm: "p-4 m-2",
  md: "p-6 m-4",
  lg: "p-8 m-6",
  xl: "p-12 m-8",
};

// Consistent colors
const colors = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  muted: "bg-muted text-muted-foreground",
  accent: "bg-accent text-accent-foreground",
};

// Consistent typography
const typography = {
  h1: "text-3xl font-bold tracking-tight",
  h2: "text-2xl font-semibold tracking-tight",
  h3: "text-xl font-semibold tracking-tight",
  body: "text-sm text-muted-foreground",
  small: "text-xs text-muted-foreground",
};
```

### Animation Patterns

```typescript
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
  transition: { duration: 0.3 },
};

export const animations = {
  fadeIn,
  slideUp,
};
```

## Phase 10: File Creation

**Generate the following files:**

1. `apps/web/components/COMPONENT_NAME.tsx` - Main component
2. `apps/web/components/COMPONENT_NAME.test.tsx` - Test file
3. `apps/web/components/ui/COMPONENT_PART.tsx` (if needed) - Shadcn parts

**Update:**

- Add component to storybook if available
- Update component documentation
- Add to design system if reusable

## Execution Protocol

**NOW execute the following:**

1. **Parse Arguments**: Extract component type, name, description, and props
2. **Select Template**: Choose appropriate component structure template
3. **Generate Component**: Create complete component with proper patterns
4. **Add Shadcn Integration**: Integrate with Shadcn UI components
5. **Implement Responsiveness**: Add mobile-first responsive design
6. **Setup Data Fetching**: Add SWR or server component integration
7. **Create Tests**: Generate comprehensive test files
8. **Style Guidelines**: Apply consistent Tailwind CSS patterns
9. **File Creation**: Write all generated files to appropriate locations

**Examples:**

```bash
/ui-component form UserProfile "User profile form" "name:string,email:string,timezone:string"
/ui-component table EmailTable "Email data table" "data:array,onRowClick:function,onDelete:function"
/ui-component card RuleCard "Rule display card" "rule:object,onEdit:function,onDelete:function"
/ui-component modal ConfirmDialog "Confirmation modal" "title:string,message:string,onConfirm:function"
/ui-component chart StatsChart "Statistics chart" "data:array,type:string"
```

Execute UI component generation now.

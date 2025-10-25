# Toast Usage Guide

The toast system is now working! Here's how to use it in your components.

## Basic Usage

```typescript
import { useToast } from '@/hooks/use-toast'

function MyComponent() {
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Success!",
      description: "Your action was completed successfully.",
    })
  }

  const handleError = () => {
    toast({
      title: "Error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    })
  }

  return (
    <div>
      <button onClick={handleSuccess}>Show Success Toast</button>
      <button onClick={handleError}>Show Error Toast</button>
    </div>
  )
}
```

## Toast Options

- `title` (optional): The main message
- `description` (optional): Additional details
- `variant`: "default" or "destructive" (for errors)

## Examples in Your App

### Success Toast
```typescript
toast({
  title: "Round Saved!",
  description: "Your disc golf round has been saved successfully.",
})
```

### Error Toast
```typescript
toast({
  title: "Error",
  description: "Failed to save round. Please try again.",
  variant: "destructive",
})
```

### Simple Toast
```typescript
toast({
  title: "Friend request sent!",
})
```

## Testing

1. Go to the `/test` page
2. Click "Test Toast" button
3. You should see a toast notification appear at the top of the screen
4. It will automatically disappear after 5 seconds

## Features

- ✅ Auto-dismiss after 5 seconds
- ✅ Manual close button (X)
- ✅ Success and error variants
- ✅ Multiple toasts support
- ✅ Responsive design
- ✅ Accessible (screen reader friendly)

The toast system is now fully functional and ready to use throughout your app!

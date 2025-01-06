declare module '@/components/ui/date-picker' {
  import { FC } from 'react';

  interface DatePickerProps {
    value: Date; // Example prop
    onChange: (date: Date) => void; // Example prop
    // Add other props as necessary
  }

  export const DatePicker: FC<DatePickerProps>;
}
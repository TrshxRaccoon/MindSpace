import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Message = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex w-full gap-3 p-4',
        {
          'justify-end': variant === 'sent',
          'justify-start': variant === 'received',
        },
        className
      )}
      {...props}
    />
  );
});
Message.displayName = 'Message';

const MessageContent = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'max-w-[70%] rounded-lg px-3 py-2 text-sm',
        {
          'bg-primary text-primary-foreground': variant === 'sent',
          'bg-muted': variant === 'received',
        },
        className
      )}
      {...props}
    />
  );
});
MessageContent.displayName = 'MessageContent';

const MessageAvatar = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Avatar
      ref={ref}
      className={cn('h-8 w-8', className)}
      {...props}
    />
  );
});
MessageAvatar.displayName = 'MessageAvatar';

const MessageTime = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn('text-xs text-muted-foreground mt-1', className)}
      {...props}
    />
  );
});
MessageTime.displayName = 'MessageTime';

export { Message, MessageContent, MessageAvatar, MessageTime };
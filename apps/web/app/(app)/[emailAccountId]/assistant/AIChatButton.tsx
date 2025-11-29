'use client';

import { MessageCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

export function AIChatButton() {
  const { setOpen, setOpenMobile, isMobile } = useSidebar();

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        setOpen((arr) => [...arr, 'chat-sidebar']);
        if (isMobile) {
          setOpenMobile((arr) => [...arr, 'chat-sidebar']);
        }
      }}
    >
      <MessageCircleIcon className="mr-2 size-4" />
      AI Chat
    </Button>
  );
}

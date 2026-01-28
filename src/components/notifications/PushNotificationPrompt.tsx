/**
 * Push Notification Prompt Component
 * 
 * Subtle prompt to enable push notifications (shown once)
 * Can be dismissed and won't show again
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconBell, IconX } from '@tabler/icons-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

const PROMPT_DISMISSED_KEY = 'push_notification_prompt_dismissed';

export function PushNotificationPrompt() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
  } = usePushNotifications();
  const { toast } = useToast();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if prompt was previously dismissed
    const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY) === 'true';
    setIsDismissed(dismissed);
  }, []);

  const handleEnable = async () => {
    setIsProcessing(true);
    try {
      const newPermission = await requestPermission();
      
      if (newPermission !== 'granted') {
        toast({
          title: 'Permission Denied',
          description: 'Please allow notifications in your browser settings.',
          variant: 'destructive',
        });
        return;
      }

      await subscribe();
      handleDismiss(); // Auto-dismiss after successful subscription
      
      toast({
        title: 'Push Notifications Enabled',
        description: 'You will now receive real-time notifications.',
      });
    } catch (err) {
      toast({
        title: 'Failed to Enable',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
  };

  // Don't show if:
  // - Not supported
  // - Already dismissed
  // - Already subscribed
  // - Permission denied
  if (
    !isSupported ||
    isDismissed ||
    isSubscribed ||
    permission === 'denied' ||
    permission === 'granted'
  ) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg border-orange-200 bg-white z-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <IconBell className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-stone-900 mb-1">
              Enable Push Notifications
            </h4>
            <p className="text-xs text-stone-600 mb-3">
              Get real-time updates about your orders, deliveries, and important notifications.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleEnable}
                disabled={isLoading || isProcessing}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
              >
                Enable
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-xs text-stone-500 hover:text-stone-700"
              >
                Not Now
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-stone-400 hover:text-stone-600"
          >
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

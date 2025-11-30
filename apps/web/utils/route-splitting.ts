// Route-based code splitting for minimal initial bundle
export const lazyRoutes = {
  // Assistant routes - heavy AI components
  assistant: () => import('@/app/(app)/[emailAccountId]/assistant/page'),

  // Reply zero - complex email processing
  replyZero: () => import('@/app/(app)/[emailAccountId]/reply-zero/page'),

  // Automation - rule processing
  automation: () => import('@/app/(app)/[emailAccountId]/automation/page'),

  // Bulk unsubscribe - email processing
  bulkUnsubscribe: () =>
    import('@/app/(app)/[emailAccountId]/bulk-unsubscribe/page'),

  // Clean - email cleaning tools
  clean: () => import('@/app/(app)/[emailAccountId]/clean/page'),

  // Settings - complex forms
  settings: () => import('@/app/(app)/[emailAccountId]/settings/page'),
};

// Preload critical routes on user interaction
export const preloadRoute = (routeName: keyof typeof lazyRoutes) => {
  lazyRoutes[routeName]();
};

// Preload routes on hover/navigation
export const preloadOnHover = (routeName: keyof typeof lazyRoutes) => {
  const link = document.querySelector(`a[href*="${routeName}"]`);
  if (link) {
    link.addEventListener('mouseenter', () => preloadRoute(routeName), {
      once: true,
    });
  }
};

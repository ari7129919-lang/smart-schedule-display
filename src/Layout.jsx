import React from 'react';

export default function Layout({ children, currentPageName }) {
  // Display page has no layout wrapper - full screen
  if (currentPageName === 'Display') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
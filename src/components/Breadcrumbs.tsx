import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Generate BreadcrumbList structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href || undefined
    }))
  };

  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              
              return (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600 mx-2" />
                  )}
                  
                  {index === 0 && (
                    <Home className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                  )}
                  
                  {isLast ? (
                    <span className="text-gray-900 dark:text-white font-medium" aria-current="page">
                      {item.label}
                    </span>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className="text-gray-600 dark:text-gray-400 hover:text-[#ff6b35] dark:hover:text-[#ff6b35] transition-colors"
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
    </>
  );
}

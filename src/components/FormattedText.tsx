import React from "react";

interface FormattedTextProps {
  content: string;
  className?: string;
}

export default function FormattedText({ content, className = "" }: FormattedTextProps) {
  if (!content) return null;

  // Split content by lines to retain line breaks cleanly
  const lines = content.split('\n');

  // Combined Regex for Markdown links [label](url) OR raw URLs (https://..., http://..., www....)
  const combinedRegex = /(\[[^\]]+\]\((?:https?:\/\/|www\.)[^\s\)]+\)|https?:\/\/[^\s]+|www\.[^\s]+)/g;

  return (
    <div className={className}>
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          return <div key={lineIdx} className="h-2" />;
        }

        const parts = line.split(combinedRegex);

        return (
          <p key={lineIdx} className={lineIdx > 0 ? "mt-1.5" : ""}>
            {parts.map((part, partIdx) => {
              if (!part) return null;

              // 1. Check for Markdown link syntax: [Link Label](URL)
              const markdownMatch = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|www\.)[^\s\)]+)\)$/);
              if (markdownMatch) {
                const [, linkText, rawUrl] = markdownMatch;
                const href = rawUrl.startsWith('www.') ? `https://${rawUrl}` : rawUrl;
                return (
                  <a
                    key={partIdx}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-semibold break-all cursor-pointer transition-colors px-0.5 rounded hover:bg-blue-50"
                  >
                    {linkText}
                  </a>
                );
              }

              // 2. Check for Raw URL: https://... or http://... or www....
              const isRawUrl = /^(https?:\/\/[^\s]+|www\.[^\s]+)$/.test(part);
              if (isRawUrl) {
                const href = part.startsWith('www.') ? `https://${part}` : part;
                return (
                  <a
                    key={partIdx}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-semibold break-all cursor-pointer transition-colors px-0.5 rounded hover:bg-blue-50"
                  >
                    {part}
                  </a>
                );
              }

              // 3. Regular text
              return <span key={partIdx}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

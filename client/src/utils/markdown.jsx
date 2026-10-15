import React from 'react';

export const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  // Split into paragraphs / blocks
  const blocks = content.split(/\n\n+/);

  const renderInline = (text) => {
    // Escape or render inline bold, italic, code
    const parts = [];
    let remaining = text;
    let key = 0;

    // Simple parser for **bold**, *italic*, and `code`
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/;

    while (remaining) {
      const match = remaining.match(regex);
      if (!match) {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }

      const matchIndex = match.index;
      if (matchIndex > 0) {
        parts.push(<span key={key++}>{remaining.substring(0, matchIndex)}</span>);
      }

      const matchedString = match[0];
      if (matchedString.startsWith('**') && matchedString.endsWith('**')) {
        parts.push(<strong key={key++}>{matchedString.slice(2, -2)}</strong>);
      } else if (matchedString.startsWith('*') && matchedString.endsWith('*')) {
        parts.push(<em key={key++}>{matchedString.slice(1, -1)}</em>);
      } else if (matchedString.startsWith('`') && matchedString.endsWith('`')) {
        parts.push(<code key={key++}>{matchedString.slice(1, -1)}</code>);
      }

      remaining = remaining.substring(matchIndex + matchedString.length);
    }

    return parts;
  };

  return (
    <div className="article-content">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();

        // Code block ```
        if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
          const lines = trimmed.split('\n');
          const codeLines = lines.slice(1, -1).join('\n');
          return (
            <pre key={idx}>
              <code>{codeLines}</code>
            </pre>
          );
        }

        // Heading 1 #
        if (trimmed.startsWith('# ')) {
          return <h2 key={idx}>{renderInline(trimmed.substring(2))}</h2>;
        }

        // Heading 2 ##
        if (trimmed.startsWith('## ')) {
          return <h2 key={idx}>{renderInline(trimmed.substring(3))}</h2>;
        }

        // Heading 3 ###
        if (trimmed.startsWith('### ')) {
          return <h3 key={idx}>{renderInline(trimmed.substring(4))}</h3>;
        }

        // Blockquote >
        if (trimmed.startsWith('> ')) {
          return <blockquote key={idx}>{renderInline(trimmed.substring(2))}</blockquote>;
        }

        // Bullet list item
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
          return (
            <ul key={idx} style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              {items.map((item, i) => (
                <li key={i} style={{ marginBottom: '0.4rem' }}>
                  {renderInline(item.replace(/^[-*]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        // Ordered list 1.
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').filter((l) => /^\d+\.\s/.test(l.trim()));
          return (
            <ol key={idx} style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              {items.map((item, i) => (
                <li key={i} style={{ marginBottom: '0.4rem' }}>
                  {renderInline(item.replace(/^\d+\.\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        // Regular paragraph
        return <p key={idx}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
};

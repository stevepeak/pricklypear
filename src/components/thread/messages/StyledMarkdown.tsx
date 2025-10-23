import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { LinkPreview } from '../../ui/link-preview';

interface StyledMarkdownProps {
  children: string;
}

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  h1: ({ children }) => <h1 className="text-2xl font-bold mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-bold mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
  h4: ({ children }) => (
    <h4 className="text-base font-bold mb-2">{children}</h4>
  ),
  h5: ({ children }) => <h5 className="text-sm font-bold mb-2">{children}</h5>,
  h6: ({ children }) => <h6 className="text-xs font-bold mb-2">{children}</h6>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="ml-2">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic my-2">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="bg-muted/50 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="block bg-muted/50 p-3 rounded-lg text-sm font-mono overflow-x-auto my-2"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="my-2">{children}</pre>,
  a: ({ children, href }) => {
    if (!href) return <span>{children}</span>;

    return <LinkPreview href={href}>{children}</LinkPreview>;
  },
  hr: () => <hr className="my-4 border-muted-foreground/20" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full border-collapse border border-muted-foreground/20">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-muted-foreground/20">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="border border-muted-foreground/20 px-3 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-muted-foreground/20 px-3 py-2">{children}</td>
  ),
};

export function StyledMarkdown({ children }: StyledMarkdownProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

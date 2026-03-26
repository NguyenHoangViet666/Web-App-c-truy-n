
import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Heading1, Heading2, Quote } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className = '' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync value from props to editable div only if different to avoid cursor jumps
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
       // Only update if the content is drastically different (e.g. initial load)
       // Checking length helps prevent overriding user typing
       if (value === '' || Math.abs(editorRef.current.innerHTML.length - value.length) > 5) {
          editorRef.current.innerHTML = value;
       }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
        editorRef.current.focus();
    }
    handleInput();
  };

  const ToolbarButton = ({ icon: Icon, command, arg, title }: { icon: any, command: string, arg?: string, title: string }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent losing focus from editor
        execCommand(command, arg);
      }}
      className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded transition-colors"
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={`flex flex-col border border-slate-300 rounded-lg overflow-hidden bg-white ${className} ${isFocused ? 'ring-2 ring-primary/50 border-primary' : ''}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
        <ToolbarButton icon={Bold} command="bold" title="In đậm (Ctrl+B)" />
        <ToolbarButton icon={Italic} command="italic" title="In nghiêng (Ctrl+I)" />
        <ToolbarButton icon={Underline} command="underline" title="Gạch chân (Ctrl+U)" />
        <div className="w-px h-4 bg-slate-300 mx-1"></div>
        <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Căn trái" />
        <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Căn giữa" />
        <ToolbarButton icon={AlignRight} command="justifyRight" title="Căn phải" />
        <div className="w-px h-4 bg-slate-300 mx-1"></div>
        <ToolbarButton icon={Heading1} command="formatBlock" arg="H3" title="Tiêu đề lớn" />
        <ToolbarButton icon={Heading2} command="formatBlock" arg="H4" title="Tiêu đề nhỏ" />
        <div className="w-px h-4 bg-slate-300 mx-1"></div>
        <ToolbarButton icon={List} command="insertUnorderedList" title="Danh sách" />
        <ToolbarButton icon={Quote} command="formatBlock" arg="BLOCKQUOTE" title="Trích dẫn" />
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        className="flex-1 p-4 outline-none overflow-y-auto min-h-[300px] prose max-w-none [&_p]:mb-4"
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        style={{ minHeight: '300px' }}
      />
      
      {/* Footer / Word count or hints could go here */}
      <div className="px-3 py-1 bg-slate-50 border-t text-[10px] text-slate-400 text-right">
         Rich Text Editor
      </div>
    </div>
  );
};

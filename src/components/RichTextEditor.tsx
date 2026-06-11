"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

type Props = {
  initialHTML: string;
  onChange: (html: string) => void;
};

function ToolbarButton({
  active,
  onClick,
  label,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  label: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded px-2.5 py-1 text-sm transition-colors ${
        active
          ? "bg-[var(--accent)] text-white"
          : "text-foreground hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

function setLink(editor: Editor) {
  const previous = editor.getAttributes("link").href as string | undefined;
  const url = window.prompt("Link URL", previous ?? "https://");
  if (url === null) return;
  if (url === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
}

function addImage(editor: Editor) {
  const url = window.prompt("Image URL");
  if (url) editor.chain().focus().setImage({ src: url }).run();
}

export default function RichTextEditor({ initialHTML, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer nofollow" },
        },
      }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg" } }),
      Placeholder.configure({
        placeholder: "Tell your story…",
      }),
    ],
    content: initialHTML || "",
    editorProps: {
      attributes: {
        class: "prose min-h-[24rem] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) {
    return (
      <div className="min-h-[24rem] rounded-lg border border-border p-4 text-muted">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-lg border-b border-border bg-white/95 px-2 py-1.5 backdrop-blur">
        <ToolbarButton
          title="Heading"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          label={<span className="font-bold">H2</span>}
        />
        <ToolbarButton
          title="Subheading"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          label={<span className="font-bold">H3</span>}
        />
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label={<span className="font-bold">B</span>}
        />
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label={<span className="italic">i</span>}
        />
        <ToolbarButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          label={<span className="underline">U</span>}
        />
        <ToolbarButton
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          label={<span className="line-through">S</span>}
        />
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="• List"
        />
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="1. List"
        />
        <ToolbarButton
          title="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="❝ Quote"
        />
        <ToolbarButton
          title="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          label="</> Code"
        />
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          title="Add link"
          active={editor.isActive("link")}
          onClick={() => setLink(editor)}
          label="🔗 Link"
        />
        <ToolbarButton
          title="Add image"
          onClick={() => addImage(editor)}
          label="🖼 Image"
        />
        <ToolbarButton
          title="Divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          label="―"
        />
      </div>

      <BubbleMenu
        editor={editor}
        className="flex items-center gap-0.5 rounded-lg border border-border bg-white p-1 shadow-lg"
      >
        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label={<span className="font-bold">B</span>}
        />
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label={<span className="italic">i</span>}
        />
        <ToolbarButton
          title="Heading"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          label={<span className="font-bold">H2</span>}
        />
        <ToolbarButton
          title="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="❝"
        />
        <ToolbarButton
          title="Link"
          active={editor.isActive("link")}
          onClick={() => setLink(editor)}
          label="🔗"
        />
      </BubbleMenu>

      <div className="px-4 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

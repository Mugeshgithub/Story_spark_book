
"use client";

import React from 'react';
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { createRoot, Root } from 'react-dom/client';
import { ParagraphActions } from './ParagraphActions';
import { Toolbar } from "./Toolbar";
import './Tiptap.css';
import { useGoogleDrive } from '@/hooks/use-google-drive';
import { useToast } from '@/hooks/use-toast';


interface TiptapEditorProps {
    content: string;
    onChange: (richText: string) => void;
}


// This function creates the plugin. It will be called by Tiptap.
function createParagraphActionPlugin(editor: Editor) {
    // A map to store the React roots for our widgets
    const roots = new Map<number, Root>();

    const paragraphActionPlugin: Plugin = new Plugin({
        key: new PluginKey('paragraph-actions'),
        state: {
            // Initialize the plugin state by getting decorations for the initial document
            init: (_, { doc }) => getDecorations(doc),
            // Apply changes to the state when the document is updated
            apply: (tr, old) => (tr.docChanged ? getDecorations(tr.doc) : old),
        },
        props: {
            // This function provides the decorations to the editor view
            decorations(state) {
                return this.getState(state);
            },
        },
        view: () => ({
            // Clean up when the editor is destroyed
            destroy: () => {
                roots.forEach(root => root.unmount());
                roots.clear();
            }
        })
    });

    function getDecorations(doc: any) {
        const decorations: Decoration[] = [];
        const nextRoots = new Map<number, Root>();

        // Iterate over all nodes in the document
        doc.descendants((node: any, pos: number) => {
            // Only add a widget for non-empty paragraphs
            if (node.type.name === 'paragraph' && node.content.size > 0) {
                // Create a container for our React component
                const widget = document.createElement('div');
                widget.className = 'paragraph-action-widget'; // Added for potential styling

                // Reuse or create a new React root for this position
                let root = roots.get(pos);
                if (!root) {
                    root = createRoot(widget);
                }

                // Render the React component into the widget container
                root.render(<ParagraphActions editor={editor} pos={pos} />);
                nextRoots.set(pos, root);

                // Create a widget decoration and place it *after* the current node
                decorations.push(Decoration.widget(pos + node.nodeSize, widget, { side: 1, ignoreSelection: true }));
            }
        });
        
        // Clean up any old React roots that are no longer in the document
        roots.forEach((root, pos) => {
            if (!nextRoots.has(pos)) {
                root.unmount();
            }
        });

        // Update the main roots map with the current active roots
        roots.clear();
        nextRoots.forEach((root, pos) => {
            roots.set(pos, root);
        });

        // Return the set of decorations to be applied
        return DecorationSet.create(doc, decorations);
    }
    
    return paragraphActionPlugin;
}


export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const { toast } = useToast();

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                bulletList: {
                    HTMLAttributes: {
                      class: "list-disc pl-4",
                    },
                  },
                  orderedList: {
                    HTMLAttributes: {
                      class: "list-decimal pl-4",
                    },
                  },
                  heading: {
                    levels: [1, 2, 3],
                    HTMLAttributes: {
                      class: 'font-serif'
                    }
                  },
            }), 
            Underline,
            TextStyle,
            Color,
            Image.configure({
                inline: false,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'w-full h-auto rounded-md my-4 border border-border',
                },
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: "prose dark:prose-invert prose-sm sm:prose-base m-5 focus:outline-none w-full",
            },
            handleDrop: function(view, event, slice, moved) {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith("image/")) {
                        event.preventDefault();
                        const { schema } = view.state;
                        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                        if (!coordinates) return false;

                        const reader = new FileReader();
                        reader.onload = (readerEvent) => {
                           handleImageUpload(readerEvent.target?.result as string)
                            .then(url => {
                                const node = schema.nodes.image.create({ src: url });
                                const transaction = view.state.tr.insert(coordinates.pos, node);
                                view.dispatch(transaction);
                            })
                        };
                        reader.readAsDataURL(file);
                        return true;
                    }
                }
                return false;
            },
            handlePaste: function(view, event, slice) {
                if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length) {
                    const file = event.clipboardData.files[0];
                    if (file.type.startsWith("image/")) {
                        event.preventDefault();
                        const reader = new FileReader();
                        reader.onload = (readerEvent) => {
                            handleImageUpload(readerEvent.target?.result as string)
                            .then(url => {
                                const { schema } = view.state;
                                const node = schema.nodes.image.create({ src: url });
                                const transaction = view.state.tr.replaceSelectionWith(node);
                                view.dispatch(transaction);
                            })
                        };
                        reader.readAsDataURL(file);
                        return true;
                    }
                }
                return false;
            },
        },
        onUpdate({ editor }) {
          onChange(editor.getHTML());
        },
    });

    const { uploadImage } = useGoogleDrive();

    const handleImageUpload = async (dataUrl: string): Promise<string> => {
        toast({ title: "Uploading image..." });
        try {
            const fileName = `story-content-image-${Date.now()}.png`;
            const result = await uploadImage(dataUrl, fileName);
            
            if (result) {
            toast({ title: "Image uploaded successfully!" });
                return result.fileUrl;
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error("Image upload failed", error);
            toast({ variant: 'destructive', title: 'Image upload failed' });
            return 'https://placehold.co/600x400.png';
        }
    };


    // We use a stable, separate useEffect to add the plugin.
    // This ensures the editor instance is fully initialized before we interact with it.
    React.useEffect(() => {
        if (!editor) {
            return;
        }

        // We create the plugin inside the effect, passing the editor instance
        const plugin = createParagraphActionPlugin(editor);

        // A robust way to add a plugin after initialization
        // This avoids race conditions and direct state manipulation
        const { state } = editor;

        // Ensure the editor is not destroyed before reconfiguring
        if (!editor.isDestroyed) {
          const plugins = [...state.plugins, plugin];
          const newState = state.reconfigure({ plugins });
          editor.view.updateState(newState);
        }

    // We only want to run this effect when the editor instance is created.
    // Adding editor to the dependency array is correct.
    }, [editor]);
    

  return (
    <div className="flex flex-col justify-stretch min-h-[250px] h-full relative">
      <Toolbar editor={editor} handleImageUpload={handleImageUpload}/>
      <EditorContent editor={editor} className="flex-1 overflow-y-auto"/>
    </div>
  );
}

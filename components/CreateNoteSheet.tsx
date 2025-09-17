import React, { ReactNode, useState } from "react";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "./Sheet";
import { Button } from "./Button";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "./Form";
import { schema as createNoteSchema } from "../endpoints/notes_POST.schema";
import { useCreateNote } from "../helpers/useNotesQueries";

interface CreateNoteSheetProps {
  children: ReactNode;
  className?: string;
}

export const CreateNoteSheet = ({ children, className }: CreateNoteSheetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const createNoteMutation = useCreateNote();

  const form = useForm({
    schema: createNoteSchema,
    defaultValues: {
      title: "",
      content: "",
      tags: [],
    },
  });

  const onSubmit = (values: z.infer<typeof createNoteSchema>) => {
    createNoteMutation.mutate(values, {
      onSuccess: () => {
        form.setValues({ title: "", content: "", tags: [] });
        setIsOpen(false);
      },
      onError: (error) => {
        console.error("Failed to create note:", error);
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className={className}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="form-container">
            <SheetHeader>
              <SheetTitle>Create a New Note</SheetTitle>
              <SheetDescription>
                Capture your thoughts, ideas, or snippets of information.
              </SheetDescription>
            </SheetHeader>
            <div className="form-body">
              <FormItem name="title">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Note title"
                    value={form.values.title}
                    onChange={(e) => form.setValues((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormItem name="content">
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Start writing..."
                    rows={10}
                    value={form.values.content}
                    onChange={(e) => form.setValues((prev) => ({ ...prev, content: e.target.value }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormItem name="tags">
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Add tags, separated by commas"
                    value={(form.values.tags || []).join(", ")}
                    onChange={(e) => {
                      const tags = e.target.value.split(",").map(tag => tag.trim()).filter(Boolean);
                      form.setValues((prev) => ({ ...prev, tags }));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Separate tags with a comma (e.g., work, idea, project).
                </FormDescription>
                <FormMessage />
              </FormItem>
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createNoteMutation.isPending}>
                {createNoteMutation.isPending ? "Saving..." : "Save Note"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
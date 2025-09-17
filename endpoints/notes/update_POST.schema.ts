import { z } from "zod";
import superjson from "superjson";
import { type Selectable } from "kysely";
import { type Notes } from "../../helpers/schema";

export const schema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title cannot be empty.").optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type InputType = z.infer<typeof schema>;

export type Note = Selectable<Notes>;

export type OutputType = {
  note: Note;
};

export const postNotesUpdate = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/notes/update`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text());
        throw new Error((errorObject as any).error);
  }
  return superjson.parse<OutputType>(await result.text());
};
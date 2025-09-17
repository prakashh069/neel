import { z } from "zod";
import superjson from "superjson";
import { type Selectable } from "kysely";
import { type Notes } from "../helpers/schema";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type Note = Selectable<Notes>;

export type OutputType = {
  notes: Note[];
};

export const getNotes = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/notes`, {
    method: "GET",
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
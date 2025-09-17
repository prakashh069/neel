import { z } from "zod";
import { db } from "../helpers/db";
import { schema, type OutputType } from "./notes_POST.schema";
import superjson from "superjson";
import { nanoid } from "nanoid";

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const newNote = {
      id: nanoid(),
      title: input.title,
      content: input.content,
      tags: input.tags ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [createdNote] = await db
      .insertInto("notes")
      .values(newNote)
      .returningAll()
      .execute();

    if (!createdNote) {
      throw new Error("Failed to create note.");
    }

    return new Response(
      superjson.stringify({ note: createdNote } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error creating note:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: error instanceof z.ZodError ? 400 : 500,
    });
  }
}
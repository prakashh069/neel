import { db } from "../../helpers/db";
import { schema, type OutputType } from "./update_POST.schema";
import superjson from "superjson";
import { z } from "zod";

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const { id, ...updateData } = schema.parse(json);

    if (Object.keys(updateData).length === 0) {
      return new Response(
        superjson.stringify({ error: "No update data provided." }),
        { status: 400 }
      );
    }

    const [updatedNote] = await db
      .updateTable("notes")
      .set({ ...updateData, updatedAt: new Date() })
      .where("id", "=", id)
      .returningAll()
      .execute();

    if (!updatedNote) {
      return new Response(superjson.stringify({ error: "Note not found." }), {
        status: 404,
      });
    }

    return new Response(
      superjson.stringify({ note: updatedNote } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error updating note:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: error instanceof z.ZodError ? 400 : 500,
    });
  }
}
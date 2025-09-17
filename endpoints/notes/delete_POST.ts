import { db } from "../../helpers/db";
import { schema, type OutputType } from "./delete_POST.schema";
import superjson from "superjson";
import { z } from "zod";

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const { id } = schema.parse(json);

    const result = await db.deleteFrom("notes").where("id", "=", id).executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      return new Response(superjson.stringify({ error: "Note not found." }), {
        status: 404,
      });
    }

    return new Response(
      superjson.stringify({ success: true, id } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error deleting note:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: error instanceof z.ZodError ? 400 : 500,
    });
  }
}
import { db } from "../../helpers/db";
import { schema, type OutputType } from "./search_POST.schema";
import superjson from "superjson";
import { sql } from "kysely";
import { z } from "zod";

export async function handle(request: Request) {
  try {
    const json = superjson.parse(await request.text());
    const { query } = schema.parse(json);

    if (!query) {
      return new Response(superjson.stringify({ notes: [] } satisfies OutputType));
    }

    // Using ILIKE for case-insensitive partial matching.
    // For a production app with large amounts of text, a full-text search index (e.g., tsvector in PostgreSQL) would be more performant.
    const notes = await db
      .selectFrom("notes")
      .selectAll()
      .where((eb) =>
        eb.or([
          eb("title", "ilike", `%${query}%`),
          eb("content", "ilike", `%${query}%`),
          // This is a simplified search for tags. A better approach would be to use array functions if the DB supports it well.
          eb(sql`tags::text`, "ilike", `%${query}%`),
        ])
      )
      .orderBy("createdAt", "desc")
      .execute();

    return new Response(
      superjson.stringify({ notes } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error searching notes:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: error instanceof z.ZodError ? 400 : 500,
    });
  }
}
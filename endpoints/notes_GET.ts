import { db } from "../helpers/db";
import { type OutputType } from "./notes_GET.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const notes = await db
      .selectFrom("notes")
      .selectAll()
      .orderBy("createdAt", "desc")
      .execute();

    return new Response(
      superjson.stringify({ notes } satisfies OutputType)
    );
  } catch (error) {
    console.error("Error fetching notes:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
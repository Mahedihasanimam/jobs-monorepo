import * as fs from "fs";

const env = fs.readFileSync(".env", "utf-8");
let supabaseUrl = "";
let supabaseKey = "";
for (const line of env.split("\n")) {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) supabaseUrl = line.split("=")[1];
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) supabaseKey = line.split("=")[1];
}

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/exam_notices?id=eq.132`, {
    headers: {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
    }
  });
  console.log(await res.json());
}
run();

"use server";

import { getJobBySlug } from "@/lib/data";

export async function fetchSavedJobs(slugs: string[]) {
  const jobs = await Promise.all(slugs.map((slug) => getJobBySlug(slug)));
  return jobs.filter((job): job is NonNullable<typeof job> => !!job);
}

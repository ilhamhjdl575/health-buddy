import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AcceptedJobFlow } from "@/app/_components/accepted-job-flow";
import { getOpenJob } from "@/app/_lib/open-jobs";

async function OpenJobDetailContent({
  params,
}: {
  params: PageProps<"/buddy/open-jobs/[jobId]">["params"];
}) {
  const { jobId } = await params;
  const job = getOpenJob(jobId);

  if (!job) {
    notFound();
  }

  return <AcceptedJobFlow job={job} />;
}

export default function OpenJobDetailPage({
  params,
}: PageProps<"/buddy/open-jobs/[jobId]">) {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-3xl animate-pulse rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="h-6 w-32 rounded-lg bg-slate-200" />
          <div className="mt-3 h-9 w-64 rounded-lg bg-slate-200" />
          <div className="mt-7 h-80 rounded-2xl bg-slate-100" />
        </section>
      }
    >
      <OpenJobDetailContent params={params} />
    </Suspense>
  );
}

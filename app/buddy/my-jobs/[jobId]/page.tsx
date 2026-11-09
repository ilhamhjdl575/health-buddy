import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPrivateJob, getJobStatusHistory } from "@/lib/buddy/assignments";
import { BuddyJobDetailView } from "@/app/_components/buddy-job-detail-view";
import { RealtimeRefresh } from "@/app/_components/realtime-refresh";

export const instant = false;

async function Detail({ params }: { params: Promise<{ jobId: string }> }) {
  await connection();
  const { jobId } = await params;
  const [job, history] = await Promise.all([
    getPrivateJob(jobId),
    getJobStatusHistory(jobId),
  ]);

  if (!job) notFound();

  return (
    <>
      <RealtimeRefresh
        channel={`job-detail:${jobId}`}
        table="job_status_history"
        filter={`service_request_id=eq.${jobId}`}
        event="INSERT"
      />
      <BuddyJobDetailView
        key={`${job.request_status}:${history.length}`}
        job={{
          requestId: jobId,
          recipientName: job.recipient_name,
          recipientPhone: job.recipient_phone,
          serviceType: job.service_type,
          serviceDate: job.service_date,
          startTime: job.start_time,
          endTime: job.end_time,
          pickupAddress: job.pickup_address,
          destinationAddress: job.destination_address,
          requestStatus: job.request_status,
          mobilitySummary: job.mobility_summary ?? [],
          emergencyName: job.emergency_name,
          emergencyPhone: job.emergency_phone,
        }}
        initialHistory={history}
      />
    </>
  );
}

export default function Page({ params }: { params: Promise<{ jobId: string }> }) {
  return (
    <Suspense fallback={<p className="p-4 text-slate-600">กำลังโหลดรายละเอียดงาน...</p>}>
      <Detail params={params} />
    </Suspense>
  );
}

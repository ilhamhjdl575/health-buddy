"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export type NotificationItem={id:string;type:string;title:string;message:string;serviceRequestId:string|null;isRead:boolean;createdAt:string};
export async function getMyNotifications():Promise<NotificationItem[]>{const s=await createClient();const{data,error}=await s.rpc("get_my_notifications",{p_limit:30});if(error)return[];return((data??[])as Array<{id:string;type:string;title:string;message:string;service_request_id:string|null;is_read:boolean;created_at:string}>).map(n=>({id:n.id,type:n.type,title:n.title,message:n.message,serviceRequestId:n.service_request_id,isRead:n.is_read,createdAt:n.created_at}));}
export async function readNotification(id:string){const s=await createClient();const{error}=await s.rpc("mark_notification_read",{p_notification_id:id});if(error)return{success:false as const};revalidatePath("/", "layout");return{success:true as const};}
export async function readAllNotifications(){const s=await createClient();const{error}=await s.rpc("mark_all_notifications_read");if(error)return{success:false as const};revalidatePath("/", "layout");return{success:true as const};}

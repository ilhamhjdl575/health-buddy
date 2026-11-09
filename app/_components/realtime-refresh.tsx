"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
type Props={channel:string;table:string;filter:string;event?:"*"|"INSERT"|"UPDATE"|"DELETE"};
export function RealtimeRefresh({channel,table,filter,event="*"}:Props){const router=useRouter();useEffect(()=>{const s=createClient();const subscription=s.channel(channel).on("postgres_changes",{event,schema:"public",table,filter},()=>router.refresh()).subscribe();return()=>{void s.removeChannel(subscription);};},[channel,event,filter,router,table]);return null;}

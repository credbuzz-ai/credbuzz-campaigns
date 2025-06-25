import apiClient from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data } = await apiClient.get("/user/claim-x-follow");

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error claiming X follow:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Internal server error" },
      { status: error.response?.status || 500 }
    );
  }
}

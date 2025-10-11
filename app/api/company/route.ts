import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: company, error } = await supabase.from("companies").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return NextResponse.json({ company })
  } catch (error) {
    console.error("[v0] Error fetching company:", error)
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data: company, error } = await supabase
      .from("companies")
      .insert({
        user_id: user.id,
        ...body,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ company })
  } catch (error) {
    console.error("[v0] Error creating company:", error)
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data: company, error } = await supabase
      .from("companies")
      .update(body)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ company })
  } catch (error) {
    console.error("[v0] Error updating company:", error)
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 })
  }
}

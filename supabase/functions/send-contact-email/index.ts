import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const TO_EMAIL = "mimetria@eneccdubai.com"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { type, name, email, phone, message, service, propertyLocation, propertyType, bedrooms, expectedRevenue } = body

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    let subject: string
    let htmlContent: string

    if (type === "owner") {
      subject = `[ENECC] New property owner inquiry from ${name}`
      htmlContent = `
        <h2>New Property Owner Inquiry</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
          ${phone ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone}</td></tr>` : ""}
          ${propertyLocation ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Property Location</td><td style="padding:8px;border-bottom:1px solid #eee;">${propertyLocation}</td></tr>` : ""}
          ${propertyType ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Property Type</td><td style="padding:8px;border-bottom:1px solid #eee;">${propertyType}</td></tr>` : ""}
          ${bedrooms ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Bedrooms</td><td style="padding:8px;border-bottom:1px solid #eee;">${bedrooms}</td></tr>` : ""}
          ${expectedRevenue ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Expected Revenue</td><td style="padding:8px;border-bottom:1px solid #eee;">${expectedRevenue}</td></tr>` : ""}
          ${message ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Message</td><td style="padding:8px;border-bottom:1px solid #eee;">${message}</td></tr>` : ""}
        </table>
      `
    } else {
      subject = `[ENECC] New contact from ${name}`
      htmlContent = `
        <h2>New Contact Form Submission</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
          ${phone ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone}</td></tr>` : ""}
          ${service ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Service</td><td style="padding:8px;border-bottom:1px solid #eee;">${service}</td></tr>` : ""}
          ${message ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Message</td><td style="padding:8px;border-bottom:1px solid #eee;">${message}</td></tr>` : ""}
        </table>
      `
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ENECC Dubai <onboarding@resend.dev>",
        to: [TO_EMAIL],
        reply_to: email,
        subject,
        html: htmlContent,
      }),
    })

    const resData = await res.json()

    if (!res.ok) {
      console.error("Resend error:", resData)
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: resData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("Error:", err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})

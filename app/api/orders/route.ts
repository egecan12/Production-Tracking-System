import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Tüm gerekli alanların var olup olmadığını kontrol et
    const requiredFields = [
      "order_number",
      "customer_name",
      "product_type",
      "thickness",
      "width",
      "diameter",
      "length",
      "weight",
      "isolation_type",
      "delivery_week",
      "production_start_date",
    ];

    const missingFields = requiredFields.filter((field) => !(field in data));

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Eksik alanlar: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Numeric değerlerin doğrulaması
    const numericFields = [
      "thickness",
      "width",
      "diameter",
      "length",
      "weight",
      "delivery_week",
    ];

    for (const field of numericFields) {
      const value = data[field];
      if (isNaN(Number(value)) || value === null || value === undefined) {
        return NextResponse.json(
          {
            error: `${field} bir sayı olmalıdır`,
          },
          { status: 400 }
        );
      }
    }

    // Veritabanına kaydetme
    const { data: insertedData, error } = await supabase
      .from("orders")
      .insert([data])
      .select();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Sipariş başarıyla oluşturuldu",
        data: insertedData,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
    
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Siparişler başarıyla alındı",
        data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
    
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
} 
import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export async function GET() {
  try {
    // Uncomment this line to use a database
    // const data = await db.select().from(advocates);

    const data = advocateData;

    return Response.json({ 
      data,
      count: data.length,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching advocates:', error);
    return Response.json(
      { 
        error: 'Failed to fetch advocates', 
        success: false 
      }, 
      { status: 500 }
    );
  }
}

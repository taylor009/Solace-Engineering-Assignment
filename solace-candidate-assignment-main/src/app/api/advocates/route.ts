import { NextRequest } from 'next/server';
import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const degree = searchParams.get('degree') || '';
    const experience = searchParams.get('experience') || '';
    const sortBy = searchParams.get('sortBy') || '';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Uncomment this line to use a database with proper filtering
    // const data = await db.select().from(advocates);

    let data = [...advocateData];

    // Server-side filtering for better performance
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter((advocate) => {
        return (
          advocate.firstName.toLowerCase().includes(searchLower) ||
          advocate.lastName.toLowerCase().includes(searchLower) ||
          advocate.city.toLowerCase().includes(searchLower) ||
          advocate.degree.toLowerCase().includes(searchLower) ||
          advocate.specialties.some((specialty: string) => specialty.toLowerCase().includes(searchLower)) ||
          advocate.yearsOfExperience.toString().includes(searchLower)
        );
      });
    }

    if (degree) {
      data = data.filter(advocate => advocate.degree === degree);
    }

    if (experience) {
      switch (experience) {
        case "0-5":
          data = data.filter(advocate => advocate.yearsOfExperience <= 5);
          break;
        case "6-10":
          data = data.filter(advocate => advocate.yearsOfExperience >= 6 && advocate.yearsOfExperience <= 10);
          break;
        case "11+":
          data = data.filter(advocate => advocate.yearsOfExperience >= 11);
          break;
      }
    }

    // Server-side sorting
    if (sortBy) {
      data.sort((a, b) => {
        let aValue: any = a[sortBy as keyof typeof a];
        let bValue: any = b[sortBy as keyof typeof b];

        if (sortBy === "yearsOfExperience") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    // Server-side pagination
    const totalCount = data.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);

    return Response.json({ 
      data: paginatedData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: endIndex < totalCount
      },
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

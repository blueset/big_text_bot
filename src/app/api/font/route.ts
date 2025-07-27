import { NextRequest } from "next/server";
import loaderStrs from "./loader_strs.json";

export async function GET(request: NextRequest) {
    const families = request.nextUrl.searchParams.getAll("family")
        .filter((f): f is keyof typeof loaderStrs => f in loaderStrs)
        .map(f => `${f}:${loaderStrs[f]}`);
    const url = new URL("https://fonts.googleapis.com/css2");
    families.forEach(family => url.searchParams.append("family", family));
    url.searchParams.append("display", "swap");
    
    // Fetch the CSS from Google Fonts and return it with CORS headers
    const response = await fetch(url.toString());
    const css = await response.text();
    
    return new Response(css, {
        headers: {
            'Content-Type': 'text/css',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
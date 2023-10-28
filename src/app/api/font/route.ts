import { NextRequest } from "next/server";
import loaderStrs from "./loader_strs.json";

export async function GET(request: NextRequest) {
    const families = request.nextUrl.searchParams.getAll("family")
        .filter((f): f is keyof typeof loaderStrs => f in loaderStrs)
        .map(f => `${f}:${loaderStrs[f]}`);
    const url = new URL("https://fonts.googleapis.com/css2");
    families.forEach(family => url.searchParams.append("family", family));
    url.searchParams.append("display", "swap");
    return Response.redirect(url.toString(), 302);
}
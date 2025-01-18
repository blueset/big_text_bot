#!/usr/bin/env deno run --allow-read --allow-write --allow-net

import { parse } from "jsr:@std/csv";

async function main() {
    const metadataReq = await fetch("https://fonts.google.com/metadata/fonts");
    const metadata = await metadataReq.json();
    const familiiesReq = await fetch("https://github.com/google/fonts/raw/refs/heads/main/tags/all/families.csv");
    const families: {name: string, family: string, score: string}[] = parse(await familiiesReq.text(), {
        skipFirstRow: false,
        columns: ["name", "family", "score"],
    });

    const fonts = metadata.familyMetadataList.map((f: any) => {
        return {
            name: f.family,
            classifications: [f.category, ...f.classifications],
            families: families.filter(ff => ff.name === f.family).map(ff => ({family: ff.family, score: ff.score}))
        }
    });

    const uniqueFamilies = Array.from(new Set<string>(families.map(f => f.family)));
    const uniqueClassifications = Array.from(new Set<string>(fonts.flatMap(f => f.classifications)));

    const fontInfo = {
        families: uniqueFamilies,
        classifications: uniqueClassifications,
        fonts: fonts
    };

    await Deno.writeTextFile("src/app/editor/fontInfo.json", JSON.stringify(fontInfo, null, 0));
}

if (import.meta.main) {
    main();
}
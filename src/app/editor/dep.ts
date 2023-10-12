import path from "path";

// Require wasm_webp wasm binary to be included.
() => path.resolve(process.cwd(), '../../../node_modules/@saschazar/wasm-webp/wasm_webp.wasm');

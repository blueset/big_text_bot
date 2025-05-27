declare module "dom-to-image-more" {
    export interface DomToImageOptions {
        filter?: (node: Node) => boolean;
        onclone?: (clonedNode: HTMLElement) => void | Promise<void>;
        bgcolor?: string;
        width?: number;
        height?: number;
        style?: Partial<CSSStyleDeclaration>;
        quality?: number; // Only for JPEG
        scale?: number;
        imagePlaceholder?: string;
        cacheBust?: boolean;
        styleCaching?: 'strict' | 'relaxed';
        copyDefaultStyles?: boolean;
        disableEmbedFonts?: boolean;
        corsImg?: {
            url?: string;
            method?: 'GET' | 'POST';
            headers?: Record<string, string>;
            data?: Record<string, any>;
        };
        useCredentials?: boolean;
        useCredentialsFilters?: string[];
        httpTimeout?: number;
        adjustClonedNode?: (sourceNode: Node, clonedNode: Node, after: boolean) => void;
        filterStyles?: (sourceNode: Node, propertyName: string) => boolean;
    }

    export interface DomToImageUtil {
        // String and RegExp helpers
        escape(string: string): string;
        escapeXhtml(string: string): string;

        // URL and data helpers
        isDataUrl(url: string): boolean;
        resolveUrl(url: string, baseUrl: string): string;
        getAndEncode(url: string): Promise<string>;

        // Image and Canvas
        canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob>;
        makeImage(uri: string): Promise<HTMLImageElement | undefined>;

        // UID
        uid(): string;

        // Delay
        delay<T>(ms: number): (arg: T) => Promise<T>;

        // Array helpers
        asArray<T>(arrayLike: ArrayLike<T>): T[];

        // Dimensions
        width(node: Node): number;
        height(node: Node): number;
        isDimensionMissing(value: any): boolean;

        // Window
        getWindow(node: Node): Window;

        // Node type checks
        isElement(value: any): value is Element;
        isHTMLElement(value: any): value is HTMLElement;
        isHTMLCanvasElement(value: any): value is HTMLCanvasElement;
        isHTMLInputElement(value: any): value is HTMLInputElement;
        isHTMLImageElement(value: any): value is HTMLImageElement;
        isHTMLLinkElement(value: any): value is HTMLLinkElement;
        isHTMLScriptElement(value: any): value is HTMLScriptElement;
        isHTMLStyleElement(value: any): value is HTMLStyleElement;
        isHTMLTextAreaElement(value: any): value is HTMLTextAreaElement;
        isSVGElement(value: any): value is SVGElement;
        isSVGRectElement(value: any): value is SVGRectElement;
        isShadowRoot(value: any): boolean;
        isInShadowRoot(value: any): boolean;
        isElementHostForOpenShadowRoot(value: any): boolean;
        isShadowSlotElement(value: any): boolean;
    }

    export interface DomToImage {
        toSvg(node: Node, options?: DomToImageOptions): Promise<string>;
        toPng(node: Node, options?: DomToImageOptions): Promise<string>;
        toJpeg(node: Node, options?: DomToImageOptions): Promise<string>;
        toBlob(node: Node, options?: DomToImageOptions): Promise<Blob>;
        toPixelData(node: Node, options?: DomToImageOptions): Promise<Uint8ClampedArray>;
        toCanvas(node: Node, options?: DomToImageOptions): Promise<HTMLCanvasElement>;
        impl: {
            fontFaces: any;
            images: any;
            util: DomToImageUtil;
            inliner: any;
            urlCache: any[];
            options: any;
        };
    }

    const domtoimage: DomToImage;
    export = domtoimage;
}
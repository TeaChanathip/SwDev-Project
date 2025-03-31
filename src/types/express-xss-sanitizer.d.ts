// Note: "express-xss-sanitizer" does not directly support TypeScript
// So we need to declare the module by ourself

declare module "express-xss-sanitizer" {
    import { RequestHandler } from "express"

    interface XSSOptions {
        allowedKeys?: string[]
        allowedAttributes?: Record<string, string[]>
        allowedTags?: string[]
    }

    function xss(options?: XSSOptions): RequestHandler
    function sanitize<T>(data: T, options?: XSSOptions): T

    export { xss, sanitize, XSSOptions }
}

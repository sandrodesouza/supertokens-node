"use strict";
/**
 * Inspired by and credit to request-ip [https://github.com/pbojinov/request-ip]
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIp = void 0;
const regExes = {
    ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
    ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,
};
function isIp(value) {
    return !!value && (regExes.ipv4.test(value) || regExes.ipv6.test(value));
}
function getClientIpFromXForwardedFor(value) {
    if (!value) {
        return null;
    }
    // x-forwarded-for may return multiple IP addresses in the format:
    // "client IP, proxy 1 IP, proxy 2 IP"
    // Therefore, the right-most IP address is the IP address of the most recent proxy
    // and the left-most IP address is the IP address of the originating client.
    // source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For
    // Azure Web App's also adds a port for some reason, so we'll only use the first part (the IP)
    const forwardedIps = value.split(",").map((e) => {
        const ip = e.trim();
        if (ip.includes(":")) {
            const splitted = ip.split(":");
            // make sure we only use this if it's ipv4 (ip:port)
            if (splitted.length === 2) {
                return splitted[0];
            }
        }
        return ip;
    });
    // Sometimes IP addresses in this header can be 'unknown' (http://stackoverflow.com/a/11285650).
    // Therefore taking the right-most IP address that is not unknown
    // A Squid configuration directive can also set the value to "unknown" (http://www.squid-cache.org/Doc/config/forwarded_for/)
    for (let i = 0; i < forwardedIps.length; i++) {
        if (isIp(forwardedIps[i])) {
            return forwardedIps[i];
        }
    }
    // If no value in the split list is an ip, return null
    return null;
}
function getClientIp(req) {
    // Standard headers used by Amazon EC2, Heroku, and others.
    if (isIp(req.getHeaderValue("x-client-ip"))) {
        return req.getHeaderValue("x-client-ip");
    }
    // Load-balancers (AWS ELB) or proxies.
    const xForwardedFor = getClientIpFromXForwardedFor(req.getHeaderValue("x-forwarded-for"));
    if (!!xForwardedFor && isIp(xForwardedFor)) {
        return xForwardedFor;
    }
    // Cloudflare.
    // @see https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-
    // CF-Connecting-IP - applied to every request to the origin.
    if (isIp(req.getHeaderValue("cf-connecting-ip"))) {
        return req.getHeaderValue("cf-connecting-ip");
    }
    // DigitalOcean.
    // @see https://www.digitalocean.com/community/questions/app-platform-client-ip
    // DO-Connecting-IP - applied to app platform servers behind a proxy.
    if (isIp(req.getHeaderValue("do-connecting-ip"))) {
        return req.getHeaderValue("do-connecting-ip");
    }
    // Fastly and Firebase hosting header (When forwared to cloud function)
    if (isIp(req.getHeaderValue("fastly-client-ip"))) {
        return req.getHeaderValue("fastly-client-ip");
    }
    // Akamai and Cloudflare: True-Client-IP.
    if (isIp(req.getHeaderValue("true-client-ip"))) {
        return req.getHeaderValue("true-client-ip");
    }
    // Default nginx proxy/fcgi; alternative to x-forwarded-for, used by some proxies.
    if (isIp(req.getHeaderValue("x-real-ip"))) {
        return req.getHeaderValue("x-real-ip");
    }
    // (Rackspace LB and Riverbed's Stingray)
    // http://www.rackspace.com/knowledge_center/article/controlling-access-to-linux-cloud-sites-based-on-the-client-ip-address
    // https://splash.riverbed.com/docs/DOC-1926
    if (isIp(req.getHeaderValue("x-cluster-client-ip"))) {
        return req.getHeaderValue("x-cluster-client-ip");
    }
    if (isIp(req.getHeaderValue("x-forwarded"))) {
        return req.getHeaderValue("x-forwarded");
    }
    if (isIp(req.getHeaderValue("forwarded-for"))) {
        return req.getHeaderValue("forwarded-for");
    }
    if (isIp(req.getHeaderValue("forwarded"))) {
        return req.getHeaderValue("forwarded");
    }
    // Google Cloud App Engine
    // https://cloud.google.com/appengine/docs/standard/go/reference/request-response-headers
    if (isIp(req.getHeaderValue("x-appengine-user-ip"))) {
        return req.getHeaderValue("x-appengine-user-ip");
    }
    // Cloudflare fallback
    // https://blog.cloudflare.com/eliminating-the-last-reasons-to-not-enable-ipv6/#introducingpseudoipv4
    if (isIp(req.getHeaderValue("Cf-Pseudo-IPv4"))) {
        return req.getHeaderValue("Cf-Pseudo-IPv4");
    }
    // // AWS Api Gateway + Lambda
    // if (!!req.requestContext && !!req.requestContext.identity && isIp(req.requestContext.identity.sourceIp)) {
    //     return req.requestContext.identity.sourceIp;
    // }
    return;
}
exports.getClientIp = getClientIp;

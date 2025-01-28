// I would not consider this as full-proof strong rate limiting method, but it is a good start to prevent some basic attacks like brute force attacks.
import rateLimit from "express-rate-limit";

export const ipLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "You have exceeded the 100 requests in 15 minutes limit!",
    headers: true,
})

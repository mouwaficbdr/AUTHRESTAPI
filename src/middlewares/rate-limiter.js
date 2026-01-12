import {rateLimit} from 'express-rate-limit'

export const Ratelimiter = rateLimit({
  max:10,
  windowMs:  60 * 60 * 1000,
  message: "We have received too many request from this IP, Please try an hour later"
})

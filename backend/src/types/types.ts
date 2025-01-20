import jwt from "jsonwebtoken";
import type{ Request } from "express";

export interface JwtPayloadWithEmail extends jwt.JwtPayload {
    email: string;
}

export interface RequestWithEmail extends Request {
    email: string;
}
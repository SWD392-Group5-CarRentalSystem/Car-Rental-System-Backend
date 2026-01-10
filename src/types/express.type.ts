import { UserPayload } from "./user.type";
import { Request } from "express";
export interface RequestCustom extends Request {
  user?: UserPayload;
}

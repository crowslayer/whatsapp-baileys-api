import { Request, Response, NextFunction } from "express";

export interface Controller {
    handle(req:Request, res:Response, next:NextFunction):Promise<void> | void;
}
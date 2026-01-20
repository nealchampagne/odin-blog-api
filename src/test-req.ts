// src/test-req.ts
import type { Request } from "express";

const fn = (req: Request) => {
  req.user; // hover this
};

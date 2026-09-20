import { Response } from "express";

export function parsePositiveId(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function sendError(
  res: Response,
  error: unknown,
  message = "Request failed.",
): void {
  const databaseError = error as { code?: string };
  if (databaseError.code === "ER_DUP_ENTRY") {
    res
      .status(409)
      .json({
        status: "error",
        message: "The record conflicts with an existing record.",
      });
    return;
  }
  if (databaseError.code === "ER_NO_REFERENCED_ROW_2") {
    res
      .status(400)
      .json({
        status: "error",
        message: "A referenced record does not exist.",
      });
    return;
  }
  if (databaseError.code === "ER_ROW_IS_REFERENCED_2") {
    res
      .status(409)
      .json({
        status: "error",
        message: "The record is still referenced by other records.",
      });
    return;
  }
  res.status(500).json({ status: "error", message });
}

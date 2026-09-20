import { Request, Response } from "express";
import { RoomModel, Room } from "../models/roomModel";
import { parsePositiveId, sendError } from "../utils/http";

export const RoomController = {
  async getAllRooms(req: Request, res: Response) {
    try {
      const rooms = await RoomModel.findAll();
      res.status(200).json({ status: "success", data: rooms });
    } catch (error: unknown) {
      sendError(res, error, "Room operation failed.");
    }
  },

  async getRoomById(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid room ID" });
      }

      const room = await RoomModel.findById(id);
      if (!room) {
        return res
          .status(404)
          .json({ status: "error", message: "Room not found" });
      }
      res.status(200).json({ status: "success", data: room });
    } catch (error: unknown) {
      sendError(res, error, "Room operation failed.");
    }
  },

  async createRoom(req: Request, res: Response) {
    try {
      const newRoomData: Room = req.body;
      if (
        !newRoomData.room_number ||
        !Number.isFinite(newRoomData.price_per_night) ||
        !newRoomData.room_type
      ) {
        return res
          .status(400)
          .json({
            status: "error",
            message:
              "Missing required fields (room_number, price_per_night, room_type)",
          });
      }

      const roomId = await RoomModel.create(newRoomData);
      res
        .status(201)
        .json({
          status: "success",
          message: "Room created successfully",
          data: { room_id: roomId, ...newRoomData },
        });
    } catch (error: unknown) {
      sendError(res, error, "Room operation failed.");
    }
  },

  async updateRoom(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid room ID" });
      }

      const updated = await RoomModel.update(id, req.body);
      if (!updated) {
        return res
          .status(404)
          .json({
            status: "error",
            message: "Room not found or no changes made",
          });
      }
      res
        .status(200)
        .json({ status: "success", message: "Room updated successfully" });
    } catch (error: unknown) {
      sendError(res, error, "Room operation failed.");
    }
  },

  async deleteRoom(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid room ID" });
      }

      const deleted = await RoomModel.delete(id);
      if (!deleted) {
        return res
          .status(404)
          .json({ status: "error", message: "Room not found" });
      }
      res
        .status(200)
        .json({ status: "success", message: "Room deleted successfully" });
    } catch (error: unknown) {
      sendError(res, error, "Room operation failed.");
    }
  },
};

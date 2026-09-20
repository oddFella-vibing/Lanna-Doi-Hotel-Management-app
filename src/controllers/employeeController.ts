import { Request, Response } from "express";
import { EmployeeModel, Employee } from "../models/employeeModel";
import { parsePositiveId, sendError } from "../utils/http";

export const EmployeeController = {
  async getAllEmployees(req: Request, res: Response) {
    try {
      const employees = await EmployeeModel.findAll();
      res.status(200).json({ status: "success", data: employees });
    } catch (error: unknown) {
      sendError(res, error, "Employee operation failed.");
    }
  },

  async getEmployeeById(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid employee ID" });
      }

      const employee = await EmployeeModel.findById(id);
      if (!employee) {
        return res
          .status(404)
          .json({ status: "error", message: "Employee not found" });
      }
      res.status(200).json({ status: "success", data: employee });
    } catch (error: unknown) {
      sendError(res, error, "Employee operation failed.");
    }
  },

  async createEmployee(req: Request, res: Response) {
    try {
      const role = req.body.role || req.body.title;
      const newEmpData: Employee = { ...req.body, role };
      if (
        !newEmpData.first_name ||
        !newEmpData.last_name ||
        !newEmpData.email ||
        !newEmpData.phone_number ||
        !role
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Missing required fields (first_name, last_name, email, phone_number, role)",
        });
      }

      const employeeId = await EmployeeModel.create(newEmpData);
      res
        .status(201)
        .json({
          status: "success",
          message: "Employee created successfully",
          data: { employee_id: employeeId, ...newEmpData },
        });
    } catch (error: unknown) {
      sendError(res, error, "Employee operation failed.");
    }
  },

  async updateEmployee(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid employee ID" });
      }

      const updateData = { ...req.body };
      if (updateData.role === undefined && updateData.title !== undefined) {
        updateData.role = updateData.title;
        delete updateData.title;
      }
      const updated = await EmployeeModel.update(id, updateData);
      if (!updated) {
        return res
          .status(404)
          .json({
            status: "error",
            message: "Employee not found or no changes made",
          });
      }
      res
        .status(200)
        .json({ status: "success", message: "Employee updated successfully" });
    } catch (error: unknown) {
      sendError(res, error, "Employee operation failed.");
    }
  },

  async deleteEmployee(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid employee ID" });
      }

      const deleted = await EmployeeModel.delete(id);
      if (!deleted) {
        return res
          .status(404)
          .json({ status: "error", message: "Employee not found" });
      }
      res
        .status(200)
        .json({ status: "success", message: "Employee deleted successfully" });
    } catch (error: unknown) {
      sendError(res, error, "Employee operation failed.");
    }
  },
};

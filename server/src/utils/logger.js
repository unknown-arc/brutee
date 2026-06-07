// utils/logger.js
import AuditLog from "../models/AuditLog.js";

export const logEvent = async ({ userId, action, resourceType, resourceId, description, ipAddress }) => {
  try {
    await AuditLog.create({
      performedBy: userId,
      action,
      resourceType,
      resourceId,
      description,
      ipAddress
    });
  } catch (error) {
    console.error("Audit Log Failed:", error.message);
  }
};
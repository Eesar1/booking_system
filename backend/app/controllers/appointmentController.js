const mongoose = require("mongoose");
const Appointment = require("../models/appointment");
const Service = require("../models/service");
const User = require("../models/user");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const canAccessAppointment = (appointment, user) =>
  user.role === "admin" || appointment.customer.toString() === user._id.toString();

const createAppointment = async (req, res) => {
  try {
    const { service, appointmentDate, startTime, endTime, notes, customerId } = req.body;

    if (!service || !appointmentDate || !startTime || !endTime) {
      return res.status(400).json({
        message: "Service, appointmentDate, startTime, and endTime are required."
      });
    }

    if (!isValidObjectId(service)) {
      return res.status(400).json({ message: "Invalid service id." });
    }

    const parsedDate = parseDate(appointmentDate);
    if (!parsedDate) {
      return res.status(400).json({ message: "Invalid appointment date." });
    }

    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return res.status(404).json({ message: "Service not found." });
    }

    let customer = req.user._id;
    if (req.user.role === "admin" && customerId) {
      if (!isValidObjectId(customerId)) {
        return res.status(400).json({ message: "Invalid customer id." });
      }
      const customerDoc = await User.findById(customerId);
      if (!customerDoc || customerDoc.role !== "customer") {
        return res.status(404).json({ message: "Customer not found." });
      }
      customer = customerDoc._id;
    }

    const appointment = await Appointment.create({
      customer,
      service: serviceDoc._id,
      appointmentDate: parsedDate,
      startTime,
      endTime,
      notes
    });

    const populated = await Appointment.findById(appointment._id)
      .populate("customer", "name email phone role")
      .populate("service", "name durationMinutes price");

    return res.status(201).json({
      message: "Appointment created successfully.",
      appointment: populated
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create appointment." });
  }
};

const getAppointments = async (req, res) => {
  try {
    const { status, service, customerId, dateFrom, dateTo } = req.query;
    const filter = {};

    if (req.user.role === "customer") {
      filter.customer = req.user._id;
    }

    if (status) {
      filter.status = status;
    }

    if (service) {
      if (!isValidObjectId(service)) {
        return res.status(400).json({ message: "Invalid service id." });
      }
      filter.service = service;
    }

    if (customerId && req.user.role === "admin") {
      if (!isValidObjectId(customerId)) {
        return res.status(400).json({ message: "Invalid customer id." });
      }
      filter.customer = customerId;
    }

    if (dateFrom || dateTo) {
      filter.appointmentDate = {};
      if (dateFrom) {
        const parsedFrom = parseDate(dateFrom);
        if (!parsedFrom) {
          return res.status(400).json({ message: "Invalid dateFrom value." });
        }
        filter.appointmentDate.$gte = parsedFrom;
      }
      if (dateTo) {
        const parsedTo = parseDate(dateTo);
        if (!parsedTo) {
          return res.status(400).json({ message: "Invalid dateTo value." });
        }
        filter.appointmentDate.$lte = parsedTo;
      }
    }

    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: 1, startTime: 1 })
      .populate("customer", "name email phone role")
      .populate("service", "name durationMinutes price");

    return res.status(200).json({ appointments });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch appointments." });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid appointment id." });
    }

    const appointment = await Appointment.findById(id)
      .populate("customer", "name email phone role")
      .populate("service", "name durationMinutes price");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (!canAccessAppointment(appointment, req.user)) {
      return res.status(403).json({ message: "Forbidden." });
    }

    return res.status(200).json({ appointment });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch appointment." });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid appointment id." });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (!canAccessAppointment(appointment, req.user)) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const allowedFields =
      req.user.role === "admin"
        ? ["customer", "service", "appointmentDate", "startTime", "endTime", "status", "notes"]
        : ["appointmentDate", "startTime", "endTime", "notes", "status"];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.user.role === "customer" && updates.status && updates.status !== "cancelled") {
      return res
        .status(403)
        .json({ message: "Customers can only change status to cancelled." });
    }

    if (updates.service) {
      if (!isValidObjectId(updates.service)) {
        return res.status(400).json({ message: "Invalid service id." });
      }
      const serviceDoc = await Service.findById(updates.service);
      if (!serviceDoc) {
        return res.status(404).json({ message: "Service not found." });
      }
    }

    if (updates.customer) {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admin can change customer." });
      }
      if (!isValidObjectId(updates.customer)) {
        return res.status(400).json({ message: "Invalid customer id." });
      }
      const customerDoc = await User.findById(updates.customer);
      if (!customerDoc || customerDoc.role !== "customer") {
        return res.status(404).json({ message: "Customer not found." });
      }
    }

    if (updates.appointmentDate) {
      const parsedDate = parseDate(updates.appointmentDate);
      if (!parsedDate) {
        return res.status(400).json({ message: "Invalid appointment date." });
      }
      updates.appointmentDate = parsedDate;
    }

    const updated = await Appointment.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .populate("customer", "name email phone role")
      .populate("service", "name durationMinutes price");

    return res.status(200).json({
      message: "Appointment updated successfully.",
      appointment: updated
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update appointment." });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment
};

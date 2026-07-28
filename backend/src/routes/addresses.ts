import { Router, Response } from "express";
import Address from "../models/Address";
import { protect, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/addresses - Get all addresses for logged-in user
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await Address.find({ user: req.user!.id }).sort("-isDefault -createdAt");
    res.json({ success: true, addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/addresses - Create new address
router.post("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { label, name, phone, address, city, pincode, isDefault } = req.body;

    if (!name || !phone || !address || !city || !pincode) {
      res.status(400).json({ success: false, message: "Name, phone, address, city, and pincode are required" });
      return;
    }

    if (isDefault) {
      await Address.updateMany({ user: req.user!.id }, { isDefault: false });
    }

    const count = await Address.countDocuments({ user: req.user!.id });
    const newAddress = await Address.create({
      user: req.user!.id,
      label: label || "Home",
      name,
      phone,
      address,
      city,
      pincode,
      isDefault: isDefault || count === 0,
    });

    res.status(201).json({ success: true, address: newAddress });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/addresses/:id - Update address
router.put("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user!.id });
    if (!address) {
      res.status(404).json({ success: false, message: "Address not found" });
      return;
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user!.id }, { isDefault: false });
    }

    Object.assign(address, req.body);
    await address.save();

    res.json({ success: true, address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/addresses/:id - Delete address
router.delete("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user!.id });
    if (!address) {
      res.status(404).json({ success: false, message: "Address not found" });
      return;
    }

    if (address.isDefault) {
      const latest = await Address.findOne({ user: req.user!.id }).sort("-createdAt");
      if (latest) {
        latest.isDefault = true;
        await latest.save();
      }
    }

    res.json({ success: true, message: "Address deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/addresses/:id/default - Set as default
router.put("/:id/default", protect, async (req: AuthRequest, res: Response) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user!.id });
    if (!address) {
      res.status(404).json({ success: false, message: "Address not found" });
      return;
    }

    await Address.updateMany({ user: req.user!.id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.json({ success: true, address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

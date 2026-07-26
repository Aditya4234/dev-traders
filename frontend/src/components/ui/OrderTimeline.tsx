"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Package, Truck, MapPin, XCircle } from "lucide-react";

const steps = [
  { key: "pending", label: "Order Placed", icon: Clock, desc: "Your order has been received" },
  { key: "processing", label: "Processing", icon: Package, desc: "Your order is being prepared" },
  { key: "shipped", label: "Shipped", icon: Truck, desc: "Your order is on the way" },
  { key: "delivered", label: "Delivered", icon: MapPin, desc: "Your order has been delivered" },
];

const cancelledStep = { key: "cancelled", label: "Cancelled", icon: XCircle, desc: "This order has been cancelled" };

interface OrderTimelineProps {
  status: string;
}

export default function OrderTimeline({ status }: OrderTimelineProps) {
  const isCancelled = status === "cancelled";
  const currentIdx = steps.findIndex((s) => s.key === status);
  const activeIdx = isCancelled ? -1 : currentIdx >= 0 ? currentIdx : 0;

  const displaySteps = isCancelled
    ? [steps[0], cancelledStep]
    : steps;

  return (
    <div className="py-4">
      {displaySteps.map((step, i) => {
        const isCompleted = !isCancelled && i <= activeIdx;
        const isCurrent = !isCancelled && i === activeIdx;
        const Icon = step.icon;

        return (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4"
          >
            {/* Line + Icon */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? step.key === "cancelled"
                      ? "border-red-400 bg-red-50"
                      : "border-emerald-400 bg-emerald-50"
                    : isCurrent
                    ? "border-primary bg-primary/10"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {isCompleted ? (
                  step.key === "cancelled" ? (
                    <XCircle size={18} className="text-red-500" />
                  ) : i < activeIdx ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <Icon size={18} className="text-primary" />
                  )
                ) : (
                  <Icon size={18} className="text-gray-300" />
                )}
              </div>
              {i < displaySteps.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[2rem] ${
                    !isCancelled && i < activeIdx
                      ? "bg-emerald-300"
                      : i === activeIdx
                      ? "bg-gradient-to-b from-primary to-gray-200"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-8 pt-1.5">
              <p
                className={`text-sm font-semibold ${
                  isCompleted ? "text-charcoal" : "text-muted"
                }`}
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted" style={{ fontFamily: "var(--font-poppins)" }}>
                {step.desc}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

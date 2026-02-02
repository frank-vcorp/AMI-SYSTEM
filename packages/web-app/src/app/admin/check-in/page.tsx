/**
 * /admin/check-in
 * Patient check-in page with QR code scanner
 * 
 * @impl IMPL-20260202-03
 * @author SOFIA
 */

"use client";

import React, { useState } from "react";

export default function CheckInPage() {
    const [qrCode, setQrCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [appointment, setAppointment] = useState<any>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleVerifyQR = async () => {
        if (!qrCode.trim()) {
            setError("Please enter a QR code");
            return;
        }

        setLoading(true);
        setError("");
        setAppointment(null);

        try {
            const response = await fetch(`/api/check-in?qrCode=${encodeURIComponent(qrCode)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to verify QR code");
            }

            if (!data.valid) {
                setError("Invalid QR code");
                return;
            }

            if (data.alreadyCheckedIn) {
                setError("Patient already checked in");
                setAppointment(data.appointment);
                return;
            }

            setAppointment(data.appointment);
        } catch (err: any) {
            setError(err.message || "Failed to verify QR code");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!appointment) return;

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/check-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to check in");
            }

            setSuccess(true);
            setTimeout(() => {
                setQrCode("");
                setAppointment(null);
                setSuccess(false);
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Failed to check in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Patient Check-In</h1>
                <p className="mt-1 text-gray-600">
                    Scan or enter patient QR code to register arrival
                </p>
            </div>

            {/* QR Input Card */}
            <div className="bg-white rounded-lg border border-gray-300 p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        QR Code
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={qrCode}
                            onChange={(e) => setQrCode(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleVerifyQR()}
                            placeholder="Enter or scan QR code..."
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                            disabled={loading}
                        />
                        <button
                            onClick={handleVerifyQR}
                            disabled={loading || !qrCode.trim()}
                            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Verifying..." : "Verify"}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-sm text-red-800">❌ {error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <p className="text-sm text-green-800">✅ Check-in successful!</p>
                    </div>
                )}
            </div>

            {/* Appointment Details */}
            {appointment && !success && (
                <div className="bg-white rounded-lg border border-gray-300 p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Appointment Details
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Patient</p>
                            <p className="font-medium">{appointment.patient?.name || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Document ID</p>
                            <p className="font-medium">{appointment.patient?.documentId || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Clinic</p>
                            <p className="font-medium">{appointment.clinic?.name || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Appointment Date</p>
                            <p className="font-medium">
                                {appointment.appointmentDate
                                    ? new Date(appointment.appointmentDate).toLocaleDateString()
                                    : "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Time</p>
                            <p className="font-medium">{appointment.time || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="font-medium">{appointment.status}</p>
                        </div>
                    </div>

                    {!error.includes("already checked in") && (
                        <div className="pt-4 border-t">
                            <button
                                onClick={handleCheckIn}
                                disabled={loading}
                                className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? "Processing..." : "✅ Confirm Check-In"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                    📋 Instructions
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Scan the patient's QR code using a barcode scanner</li>
                    <li>Or manually enter the code and click "Verify"</li>
                    <li>Review the appointment details</li>
                    <li>Click "Confirm Check-In" to register the patient's arrival</li>
                    <li>The system will create an expedient automatically</li>
                </ul>
            </div>
        </div>
    );
}

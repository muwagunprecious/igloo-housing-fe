"use client";

import { bookings } from "@/app/data/dashboard";
import { Home, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/app/components/common/Button";

export default function MyHousesPage() {
    const activeBookings = bookings.filter((b) => b.status === "Active");
    const allBookings = bookings;

    return (
        <div className="max-w-[1280px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-10 pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Houses</h1>
                <p className="text-gray-500">Manage your current and past bookings</p>
            </div>

            {/* Active Bookings */}
            <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                    <Home className="text-primary" size={24} />
                    <h2 className="text-2xl font-bold">Active Rentals</h2>
                    <span className="text-sm text-gray-500">({activeBookings.length})</span>
                </div>

                {activeBookings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeBookings.map((booking) => (
                            <div key={booking.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-card-hover transition">
                                <div className="relative h-48">
                                    <Image
                                        src={booking.propertyImage}
                                        alt={booking.propertyTitle}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                        {booking.status}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-semibold text-lg mb-2">{booking.propertyTitle}</h3>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                        <MapPin size={16} />
                                        <span>{booking.propertyAddress}</span>
                                    </div>

                                    <div className="space-y-2 text-sm mb-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar size={16} />
                                            <span>{booking.startDate} - {booking.endDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Duration:</span>
                                            <span className="font-medium">{booking.duration}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Amount Paid:</span>
                                            <span className="font-medium">₦{booking.amount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Link href={`/rooms/${booking.propertyId}`}>
                                            <Button variant="outline" className="w-full">
                                                View Property
                                            </Button>
                                        </Link>
                                        <Link href={`/receipt?txn=${booking.transactionId}`}>
                                            <Button className="w-full">
                                                View Receipt
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <Home className="mx-auto mb-4 text-gray-400" size={48} />
                        <h3 className="text-lg font-semibold mb-2">No active bookings</h3>
                        <p className="text-gray-500 mb-6">Start exploring properties and make your first booking.</p>
                        <Link href="/search">
                            <Button>Browse Properties</Button>
                        </Link>
                    </div>
                )}
            </section>

            {/* All Bookings History */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <Calendar className="text-primary" size={24} />
                    <h2 className="text-2xl font-bold">Booking History</h2>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    {allBookings.map((booking, idx) => (
                        <div key={booking.id} className={`p-6 hover:bg-gray-50 transition ${idx !== allBookings.length - 1 ? 'border-b border-gray-200' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                        <Image
                                            src={booking.propertyImage}
                                            alt={booking.propertyTitle}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{booking.propertyTitle}</h3>
                                        <p className="text-sm text-gray-500">{booking.propertyAddress}</p>
                                        <p className="text-xs text-gray-400 mt-1">{booking.startDate} - {booking.endDate}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.status === "Active" ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {booking.status}
                                    </span>
                                    <p className="text-sm font-medium mt-2">₦{booking.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

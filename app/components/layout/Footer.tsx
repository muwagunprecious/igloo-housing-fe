"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { igloo } from "@/app/assets";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo & Description */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Image src={igloo} width={100} height={60} alt="logo" />
                        </div>
                        <p className="text-sm leading-relaxed">
                            Find your perfect student housing in Nigeria. Secure, verified, and close to campus.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="hover:text-primary transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/search" className="hover:text-primary transition-colors">
                                    Search Properties
                                </Link>
                            </li>
                            <li>
                                <Link href="/roommates" className="hover:text-primary transition-colors">
                                    Find Roommates
                                </Link>
                            </li>
                            <li>
                                <Link href="/agents/dashboard" className="hover:text-primary transition-colors">
                                    List Your Property
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Support</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <Mail size={18} className="text-primary shrink-0 mt-0.5" />
                                <a href="mailto:support@igloo.ng" className="hover:text-primary transition-colors">
                                    support@igloo.ng
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone size={18} className="text-primary shrink-0 mt-0.5" />
                                <a href="tel:+2348000000000" className="hover:text-primary transition-colors">
                                    +234 800 000 0000
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                                <span>Lagos, Nigeria</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MessageCircle size={18} className="text-primary shrink-0 mt-0.5" />
                                <a href="#" className="hover:text-primary transition-colors">
                                    Live Chat
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter / Social */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
                        <p className="text-sm mb-4">Subscribe for new listings and offers.</p>
                        <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your email"
                                className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary text-sm flex-1"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm"
                            >
                                Subscribe
                            </button>
                        </form>
                        <div className="flex gap-4 mt-6">
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <span className="sr-only">Facebook</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <span className="sr-only">Twitter</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <span className="sr-only">Instagram</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-12 pt-6 text-sm text-center md:text-left text-gray-400">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p>&copy; {new Date().getFullYear()} igloo. All rights reserved.</p>
                        <div className="flex gap-6 mt-2 md:mt-0">
                            <Link href="/privacy" className="hover:text-primary transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-primary transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
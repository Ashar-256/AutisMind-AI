import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, Play, Scan, Activity, ArrowDown, ArrowUp } from 'lucide-react';
import OldLandingContent from '@/components/OldLandingContent';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col relative z-10 text-white font-sans selection:bg-lime-400 selection:text-black">

            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-6 md:px-12">
                <div className="flex items-center gap-2">
                    {/* Logo Placeholder */}
                    <div className="text-2xl font-bold tracking-tighter flex items-center gap-1">
                        <div className="w-3 h-3 bg-lime-400 rounded-full"></div>
                        AutisMind AI<sup className="text-xs text-gray-400">®</sup>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <Link to="/technology" className="hover:text-white transition-colors">Technology</Link>
                    <Link to="/healthcare" className="hover:text-white transition-colors flex items-center gap-1">
                        Healthcare
                    </Link>
                    <Link to="/solutions" className="hover:text-white transition-colors flex items-center gap-1">
                        Solutions <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col px-8 md:px-12 pt-12 md:pt-20">

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">

                    {/* Left: Main Headline */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-lime-400 mb-4">
                            <span className="w-1.5 h-1.5 bg-lime-400 rounded-full"></span>
                            AI-Infused Screening
                        </div>
                        <h1 className="text-6xl md:text-8xl font-medium tracking-tight leading-[0.9]">
                            Redefining <br />
                            Care with <br />
                            Intelligence
                        </h1>
                    </div>

                    {/* Right: Subtext & CTA */}
                    <div className="lg:col-span-5 flex flex-col justify-end pb-4 space-y-8">
                        <h2 className="md:text-4xl font-bold tracking-tight">AutisMind AI</h2>
                        <p className="text-lg text-gray-300 max-w-md leading-relaxed">
                            A web-based screening tool that uses computer vision and audio analysis to assess behavioral markers associated with autism spectrum disorder (ASD).                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <Button
                                className="bg-lime-400 hover:bg-lime-500 text-black rounded-full px-8 py-6 text-base font-medium transition-all duration-300 hover:scale-105"
                                onClick={() => {
                                    const element = document.getElementById('start-assessment');
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                Start Screening
                            </Button>
                        </div>

                        {/* <div className="flex gap-2 pt-8">
                            <Button size="icon" variant="outline" className="rounded-full w-10 h-10 border-gray-700 hover:bg-white/10 text-white">
                                <ArrowDown className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="outline" className="rounded-full w-10 h-10 border-gray-700 hover:bg-white/10 text-white">
                                <ArrowUp className="w-4 h-4" />
                            </Button>
                        </div> */}
                    </div>
                </div>

                {/* Visual Grid / Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-auto pb-8 h-64 md:h-80">

                    {/* Card 1: Face Scan / QR */}
                    <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                        <img
                            src={`${import.meta.env.BASE_URL}images/christian-bowen-OJOE587CWuE-unsplash.jpg`}
                            alt="Face Scan"
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute bottom-4 left-4">
                            <div className="bg-lime-400 p-2 rounded-lg">
                                <Scan className="w-6 h-6 text-black" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Frosted Glass / Analysis */}
                    <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md transition-all hover:bg-white/10">
                        <img
                            src={`${import.meta.env.BASE_URL}images/colin-maynard-CEEhmAGpYzE-unsplash.jpg`}
                            alt="Analysis"
                            className="w-full h-full object-cover opacity-60 blur-[2px] group-hover:blur-0 transition-all duration-700"
                        />
                        {/* <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-md bg-white/10 group-hover:scale-110 transition-transform">
                                <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                        </div> */}
                        <div className="absolute bottom-4 left-4 text-xs font-mono text-white/70">
                            ANALYZING PATTERNS...
                        </div>
                    </div>

                    {/* Card 3: Device / Tech */}
                    <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                        <img
                            src={`${import.meta.env.BASE_URL}images/tim-bish-WbC9XIlQb4k-unsplash.jpg`}
                            alt="Baby Yawning"
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                        />

                    </div>

                    {/* Card 4: Focus / Eye Tracking */}
                    <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
                        <img
                            src={`${import.meta.env.BASE_URL}images/omar-lopez-vTknj2OxDVg-unsplash.jpg`}
                            alt="Eye Tracking"
                            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute bottom-4 right-4">
                            <div className="w-10 h-10 rounded-full bg-lime-400 flex items-center justify-center">
                                <div className="w-3 h-3 bg-black rounded-full"></div>
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-4">
                            <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full border border-white/50"></div>
                            </div>
                        </div>

                        {/* Navbar */}
                        <nav className="flex items-center justify-between px-8 py-6 md:px-12">
                            <div className="flex items-center gap-2">
                                {/* Logo Placeholder */}
                                <div className="text-2xl font-bold tracking-tighter flex items-center gap-1">
                                    <div className="w-3 h-3 bg-lime-400 rounded-full"></div>
                                    AutisMind AI<sup className="text-xs text-gray-400">®</sup>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                                <Link to="/technology" className="hover:text-white transition-colors">Technology</Link>
                                <Link to="/healthcare" className="hover:text-white transition-colors flex items-center gap-1">
                                    Healthcare
                                </Link>
                                <Link to="/solutions" className="hover:text-white transition-colors flex items-center gap-1">
                                    Solutions <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </nav>

                        {/* Main Content */}
                        <main className="flex-1 flex flex-col px-8 md:px-12 pt-12 md:pt-20">

                            {/* Hero Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">

                                {/* Left: Main Headline */}
                                <div className="lg:col-span-7 space-y-6">
                                    <div className="flex items-center gap-2 text-sm font-medium text-lime-400 mb-4">
                                        <span className="w-1.5 h-1.5 bg-lime-400 rounded-full"></span>
                                        AI-Infused Screening
                                    </div>
                                    <h1 className="text-6xl md:text-8xl font-medium tracking-tight leading-[0.9]">
                                        Redefining <br />
                                        Care with <br />
                                        Intelligence
                                    </h1>
                                </div>
                                <ArrowUp className="w-4 h-4" />
                            </Button>
                    </div> */}
                </div>
        </div>

                            {/* Visual Grid / Cards */ }
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-auto pb-8 h-64 md:h-80">

        {/* Card 1: Face Scan / QR */}
        <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
            <img
                src={`${import.meta.env.BASE_URL}images/christian-bowen-OJOE587CWuE-unsplash.jpg`}
                alt="Face Scan"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-4 left-4">
                <div className="bg-lime-400 p-2 rounded-lg">
                    <Scan className="w-6 h-6 text-black" />
                </div>
            </div>
        </div>

        {/* Card 2: Frosted Glass / Analysis */}
        <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md transition-all hover:bg-white/10">
            <img
                src={`${import.meta.env.BASE_URL}images/colin-maynard-CEEhmAGpYzE-unsplash.jpg`}
                alt="Analysis"
                className="w-full h-full object-cover opacity-60 blur-[2px] group-hover:blur-0 transition-all duration-700"
            />
            {/* <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-md bg-white/10 group-hover:scale-110 transition-transform">
                                <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                        </div> */}
            <div className="absolute bottom-4 left-4 text-xs font-mono text-white/70">
                ANALYZING PATTERNS...
            </div>
        </div>

        {/* Card 3: Device / Tech */}
        <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
            <img
                src={`${import.meta.env.BASE_URL}images/tim-bish-WbC9XIlQb4k-unsplash.jpg`}
                alt="Baby Yawning"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            />

        </div>

        {/* Card 4: Focus / Eye Tracking */}
        <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10">
            <img
                src={`${import.meta.env.BASE_URL}images/omar-lopez-vTknj2OxDVg-unsplash.jpg`}
                alt="Eye Tracking"
                className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-4 right-4">
                <div className="w-10 h-10 rounded-full bg-lime-400 flex items-center justify-center">
                    <div className="w-3 h-3 bg-black rounded-full"></div>
                </div>
            </div>
            <div className="absolute bottom-4 left-4">
                <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border border-white/50"></div>
                </div>
            </div>
        </div>

    </div>

    {/* Old Landing Content */ }
    <OldLandingContent />
                        </main >
                    </div >
                    );
}

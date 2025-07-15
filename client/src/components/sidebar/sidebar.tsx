"use client"

import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { Youtube, Ticket, Menu, X, Twitter, Instagram, Music2, BadgePercent } from "lucide-react"

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const menu = [
    { name: "Youtubee", path: "/", icon: <Youtube size={18} /> },
    { name: "Tiktok", path: "/tiktok", icon: <Music2 size={18} /> },
    { name: "Instagram", path: "/instagram", icon: <Instagram size={18} /> },
    { name: "Twitter", path: "/twitter", icon: <Twitter size={18} /> },
    { name: "Ticket", path: "/ticket", icon: <Ticket size={18} /> },
     { name: "Custom Rates", path: "/custom-rates", icon: <BadgePercent size={18} /> },
  ]

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event:any) => {
      const sidebar = document.getElementById("sidebar")
      const hamburgerBtn = document.getElementById("hamburger-btn")

      if (
        isMobileMenuOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        hamburgerBtn &&
        !hamburgerBtn.contains(event.target)
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobileMenuOpen])

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Hamburger menu button - only visible on mobile */}
      {isMobile && (
        <button
          id="hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Overlay - only visible when mobile menu is open */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`
          ${isMobile ? "fixed left-0 top-0 z-40 h-full" : "w-64 min-h-screen"} 
          ${isMobile && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0"}
          bg-gray-950 text-gray-200 transition-transform duration-300 ease-in-out
        `}
      >
        <div className="p-4 text-xl font-bold text-white border-b border-gray-800 flex justify-between items-center">
          Youtubee
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-md hover:bg-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <nav className="p-4 space-y-2">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  isActive ? "bg-blue-600 text-white font-semibold" : "hover:bg-gray-800"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar

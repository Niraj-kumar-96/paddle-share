import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Navbar';
import { useAuth } from '@/lib/AuthContext';

export default function LayoutNavbar() {
  return <Navbar />;
}


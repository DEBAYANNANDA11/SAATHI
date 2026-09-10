import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#3E6B63] text-white py-8 px-6 mt-auto border-t border-[#8FCBB0]/20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Warning / Support Disclaimer */}
        <div className="max-w-xl text-center md:text-left">
          <p className="text-xs md:text-sm text-[#EEF1FB] font-medium leading-relaxed">
            <span className="font-bold text-[#8FCBB0] uppercase tracking-wide mr-1.5">Important:</span> 
            SAATHI is a support tool, not a substitute for professional care. If you're in crisis or need immediate help, please contact a local mental health helpline.
          </p>
        </div>

        {/* Branding & Quick Info */}
        <div className="flex flex-col items-center md:items-end gap-2 text-xs text-[#EEF1FB]/80">
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white hover:underline transition-all">Privacy Note</Link>
            <span>&bull;</span>
            <Link href="/" className="hover:text-white hover:underline transition-all">SIH 2026</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Team SAATHI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

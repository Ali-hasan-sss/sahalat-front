'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';
import { getT } from '@/lib/i18n';
import { useAppSelector } from '@/store/hooks';

const PHONE = '+968 9701 8484';
const EMAIL = 'info@sahalattoursom.com';
const INSTAGRAM_URL = 'https://instagram.com';
const TWITTER_URL = 'https://twitter.com';
const FACEBOOK_URL = 'https://facebook.com';

export function AppFooter() {
  const locale = useAppSelector((s) => s.language.locale);
  const t = getT(locale);
  const f = (t as { footer?: { tagline: string; aboutTitle: string; aboutText: string; contactTitle: string; location: string; followTitle: string; copyright: string } }).footer ?? {
    tagline: 'وجهتك المثالية لاكتشاف سلطنة عمان.',
    aboutTitle: 'عن الشركة',
    aboutText: 'شركة سهالات السياحة والسفر - رحلة عائلية بدأت في 2015 لنساهم في مشاركة جمال عمان الأصيل مع العالم.',
    contactTitle: 'تواصل معنا',
    location: 'مسقط، سلطنة عمان',
    followTitle: 'تابعنا',
    copyright: '2026 سهالات للسياحة والسفر. جميع الحقوق محفوظة.',
  };

  return (
    <footer className="bg-[#0A1121] text-slate-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Tagline */}
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="Sahalat" width={120} height={40} className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {f.tagline}
            </p>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-bold mb-3 text-base">{f.aboutTitle}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {f.aboutText}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 text-base">{f.contactTitle}</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={18} className="shrink-0 text-slate-400" aria-hidden />
                <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                  {PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="shrink-0 text-slate-400" aria-hidden />
                <a href={`mailto:${EMAIL}`} className="hover:text-white transition-colors">
                  {EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={18} className="shrink-0 text-slate-400 mt-0.5" aria-hidden />
                <span>{f.location}</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-bold mb-4 text-base">{f.followTitle}</h3>
            <div className="flex gap-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#007BFF] text-white hover:bg-blue-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} aria-hidden />
              </a>
              <a
                href={TWITTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#007BFF] text-white hover:bg-blue-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} aria-hidden />
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#007BFF] text-white hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700/50">
        <p className="text-center text-slate-500 text-sm py-4">
          {f.copyright}
        </p>
      </div>
    </footer>
  );
}

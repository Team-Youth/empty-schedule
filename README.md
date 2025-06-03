# 📅 Free Time Analyzer

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)
![i18n](https://img.shields.io/badge/i18n-7_languages-green)

**Find your free time instantly with our smart calendar analyzer!**

A privacy-first, multi-language web application that analyzes your ICS calendar files to find available time slots. Perfect for scheduling meetings, planning tasks, or discovering personal time.

## ✨ Features

- 🔍 **Smart Analysis** - Advanced algorithms detect conflicts and optimize schedules
- 🔒 **Privacy First** - All processing happens in your browser - no data leaves your device  
- 🌍 **Multi-language** - Support for 7 languages (EN, KO, JA, ZH, ES, FR, DE)
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 📊 **Export Results** - Export free time slots as ICS files
- ⚡ **Lightning Fast** - Instant analysis with modern web technologies
- 🎨 **Beautiful UI** - Modern, accessible interface with smooth animations

## 🌐 Supported Languages

- 🇺🇸 English
- 🇰🇷 한국어 (Korean)
- 🇯🇵 日本語 (Japanese)
- 🇨🇳 中文 (Chinese)
- 🇪🇸 Español (Spanish)
- 🇫🇷 Français (French)
- 🇩🇪 Deutsch (German)

## 🚀 Getting Started

### Prerequisites

- Node.js 16.0 or later
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/free-time-analyzer.git
   cd free-time-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
free-time-analyzer/
├── pages/
│   ├── _app.tsx           # App wrapper with i18n
│   ├── index.tsx          # Main page
│   └── api/               # API routes (if needed)
├── src/
│   ├── components/        # React components
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── CalendarAnalyzer.tsx
│   │   ├── Features.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   └── icsAnalyzer.ts # ICS parsing logic
│   └── types/
│       └── calendar.ts    # TypeScript types
├── public/
│   ├── locales/          # Translation files
│   │   ├── en/common.json
│   │   ├── ko/common.json
│   │   └── ...
│   ├── robots.txt
│   └── sitemap.xml
└── styles/
    └── globals.css       # Global styles with Tailwind
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Internationalization**: next-i18next
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Build Tool**: SWC (built into Next.js)

## 🎯 How It Works

1. **Upload** your ICS calendar file (from Google Calendar, Outlook, Apple Calendar, etc.)
2. **Configure** your analysis settings (date range, working hours, options)
3. **Analyze** your schedule to find free time slots
4. **Export** results as ICS files or share with others

## 🔒 Privacy & Security

- **Client-side processing**: All analysis happens in your browser
- **No data collection**: We don't store or transmit your calendar data
- **HTTPS security**: All connections are encrypted
- **No tracking**: Privacy-first approach

## 🌟 SEO Optimized

- Multi-language meta tags and structured data
- Optimized for search engines in all supported languages
- Fast loading with Next.js optimizations
- Accessible design following WCAG guidelines

## 📊 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Lucide](https://lucide.dev/) for beautiful icons
- [next-i18next](https://github.com/isaachinman/next-i18next) for internationalization

## 📞 Support

- 📧 Email: support@freetimeanalyzer.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/free-time-analyzer/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/free-time-analyzer/discussions)

---

**Made with ❤️ for productivity enthusiasts worldwide** 
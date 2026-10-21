'use client';

import { useState, useMemo } from 'react';

interface TranscriptItem {
  text: string;
  timestamp: string;
  offset: number;
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [fullText, setFullText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const handleFetchTranscript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setLoading(true);
    setError('');
    setTranscript([]);
    setFullText('');
    setCopied(false);
    setSearchQuery('');

    try {
      // यहाँ Vercel के बजाय Render वाले लाइव बैकएंड का URL दिया गया है
      const res = await fetch('https://youtube-transcript-backend-03cx.onrender.com/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await res.json();

      if (data.success) {
        setTranscript(data.data);
        setFullText(data.fullText);
      } else {
        setError(data.error || 'कैप्शन नहीं मिल सके।');
      }
    } catch (err) {
      setError('कुछ गड़बड़ हुई। कृपया थोड़ी देर बाद फिर से प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  // 1. Search Filter Feature
  const filteredTranscript = useMemo(() => {
    if (!searchQuery.trim()) return transcript;
    return transcript.filter((item) =>
      item.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transcript, searchQuery]);

  // 2. Copy to Clipboard
  const copyToClipboard = () => {
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 3. Download Plain Text (.txt) File
  const downloadAsTXT = () => {
    if (!fullText) return;
    const element = document.createElement('a');
    const file = new Blob([fullText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'transcript.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 4. Download SRT File (with Timestamps)
  const downloadAsSRT = () => {
    if (transcript.length === 0) return;
    let srtContent = '';
    transcript.forEach((item, index) => {
      srtContent += `${index + 1}\n[${item.timestamp}] --> ${item.text}\n\n`;
    });

    const element = document.createElement('a');
    const file = new Blob([srtContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'transcript.srt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <header className="text-center my-8">
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-400 mb-2">
            Free YouTube Transcript Generator
          </h1>
          <p className="text-slate-400">
            किसी भी YouTube वीडियो का लिंक डालें और उसका पूरा टेक्स्ट टाइमस्टैम्प के साथ तुरंत निकालें।
          </p>
        </header>

        {/* Input Form */}
        <form onSubmit={handleFetchTranscript} className="mb-8">
          <div className="flex flex-col md:flex-row gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-lg">
            <input
              type="text"
              placeholder="यहाँ YouTube वीडियो का URL पेस्ट करें..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg transition-all flex items-center justify-center min-w-[140px]"
            >
              {loading ? 'प्रोसेस हो रहा है...' : 'गेट ट्रांसक्रिप्ट'}
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="bg-red-950/80 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        {/* Results Area */}
        {transcript.length > 0 && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            {/* Action Bar / Buttons */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">वीडियो ट्रांसक्रिप्ट</h2>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
                >
                  {copied ? '✓ कॉपी हो गया!' : '📋 कॉपी ऑल'}
                </button>
                <button
                  onClick={downloadAsTXT}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
                >
                  📥 Download TXT
                </button>
                <button
                  onClick={downloadAsSRT}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
                >
                  📄 Download SRT
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="🔍 ट्रांसक्रिप्ट में शब्द खोजें (Search keyword)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
              />
            </div>

            {/* Transcript List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredTranscript.length > 0 ? (
                filteredTranscript.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-3 hover:bg-slate-700/50 rounded-lg transition-colors border border-transparent hover:border-slate-600"
                  >
                    <span className="text-red-400 font-mono text-sm shrink-0">
                      {item.timestamp}
                    </span>
                    <p className="text-slate-200 text-sm md:text-base leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-8">
                  "{searchQuery}" से मेल खाता कोई शब्द नहीं मिला।
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
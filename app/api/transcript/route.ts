import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(req: Request) {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'कृपया एक मान्य YouTube वीडियो का URL दर्ज करें।' },
        { status: 400 }
      );
    }

    // Vercel पर IP ब्लॉक से बचने के लिए custom lang और options पास करना
    let transcriptData;
    try {
      transcriptData = await YoutubeTranscript.fetchTranscript(videoUrl, {
        lang: 'hi', // पहले हिंदी ढूंढने की कोशिश करेगा
      });
    } catch (err) {
      try {
        // अगर हिंदी न मिले, तो डिफ़ॉल्ट (अक्सर English) ट्राई करेगा
        transcriptData = await YoutubeTranscript.fetchTranscript(videoUrl);
      } catch (innerErr) {
        throw innerErr;
      }
    }

    if (!transcriptData || transcriptData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'इस वीडियो के लिए कोई कैप्शन उपलब्ध नहीं हैं।' },
        { status: 404 }
      );
    }

    const formattedTranscript = transcriptData.map((item) => {
      const minutes = Math.floor(item.offset / 1000 / 60);
      const seconds = Math.floor((item.offset / 1000) % 60);
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      return {
        text: item.text,
        duration: item.duration,
        offset: item.offset,
        timestamp: formattedTime,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedTranscript,
      fullText: transcriptData.map((t) => t.text).join(' '),
    });
  } catch (error: any) {
    console.error('Transcript Fetch Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'YouTube ने इस सर्वर की रिक्वेस्ट को ब्लॉक कर दिया है या वीडियो में कैप्शन बंद हैं।',
      },
      { status: 500 }
    );
  }
}
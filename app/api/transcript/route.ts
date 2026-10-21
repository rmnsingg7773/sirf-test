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

    // YoutubeTranscript लाइब्रेरी से सबटाइटल/कैप्शन फेच करना
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoUrl);

    if (!transcriptData || transcriptData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'इस वीडियो के लिए कोई कैप्शन उपलब्ध नहीं हैं।' },
        { status: 404 }
      );
    }

    // समय को सेकेंड से mm:ss में बदलने का हेल्पर फंक्शन
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
        error:
          'कैप्शन फेच करने में विफल। सुनिश्चित करें कि वीडियो में कैप्शंस (Subtitles) चालू हैं।',
      },
      { status: 500 }
    );
  }
}
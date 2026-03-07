import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { ShareCard } from '../components/ShareCard';

export default function ShareCardScreen({ game, onBack }) {
  const cardRef = useRef(null);

  const handleShare = async () => {
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    const file = new File([blob], 'partida-pc.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'La meva partida a Pitch & Clubs',
      });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'partida-pc.png'; a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#020303',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 16px 40px',
    }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,.5)',
          fontSize: 22, cursor: 'pointer', padding: '4px 8px 4px 0',
        }}>←</button>
        <span style={{
          fontFamily: "'Bebas Neue', cursive", fontSize: 18,
          color: 'rgba(255,255,255,.7)', letterSpacing: '.1em',
        }}>COMPARTIR PARTIDA</span>
      </div>

      <div ref={cardRef} style={{ display: 'inline-block', borderRadius: 20, overflow: 'hidden' }}>
        <ShareCard game={game} />
      </div>

      <button onClick={handleShare} style={{
        marginTop: 28, width: '100%', maxWidth: 270,
        background: '#CAFF4D', color: '#111', border: 'none',
        borderRadius: 14, padding: '14px 0',
        fontFamily: "'Bebas Neue', cursive", fontSize: 18,
        letterSpacing: '.1em', cursor: 'pointer',
      }}>
        COMPARTIR A STORIES
      </button>
    </div>
  );
}

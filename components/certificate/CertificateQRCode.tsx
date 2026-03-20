// components/certificate/CertificateQRCode.tsx
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface CertificateQRCodeProps {
  credentialCode: string;
  certificateId: string;
  size?: number;
}

export const CertificateQRCode: React.FC<CertificateQRCodeProps> = ({
  credentialCode,
  certificateId,
  size = 110,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Generate QR code URL for verification
      // You can use either credential code or a full verification URL
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/certificate-verify?code=${credentialCode}`;
      
      QRCode.toCanvas(
        canvasRef.current,
        verificationUrl,
        {
          width: size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        },
        (error) => {
          if (error) {
            console.error('QR Code generation error:', error);
          }
        }
      );
    }
  }, [credentialCode, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
};

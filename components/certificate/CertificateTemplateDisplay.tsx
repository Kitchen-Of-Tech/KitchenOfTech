// components/certificate/CertificateTemplateDisplay.tsx
import React from 'react';
import { Certificate } from '@/types/education';
import { CertificateQRCode } from './CertificateQRCode';
import styles from './CertificateTemplateDisplay.module.css';

interface CertificateTemplateDisplayProps {
  certificate: Certificate;
  includeQRCode?: boolean;
}

/**
 * Certificate Template Display Component
 * 
 * This component displays the certificate template from Certificate.svg
 * with QR code in the red box area and dynamic text overlays.
 * 
 * Features:
 * - SVG template background
 * - QR code for verification link
 * - Dynamic text overlays (student name, course, dates, etc.)
 * - Print-friendly styling
 * - Responsive design
 */
export const CertificateTemplateDisplay: React.FC<
  CertificateTemplateDisplayProps
> = ({ certificate, includeQRCode = true }) => {
  const issueDate = new Date(certificate.issue_date);
  const formattedIssueDate = issueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const validUntilDate = certificate.valid_until
    ? new Date(certificate.valid_until).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className={styles.certificateWrapper}>
      <div className={styles.certificateContainer}>
        {/* SVG Template Background */}
        <svg
          className={styles.templateSvg}
          viewBox="0 0 841.9 595.3"
          preserveAspectRatio="xMidYMid meet"
        >
          <image
            href="/certificates/Certificate.svg"
            x="0"
            y="0"
            width="841.9"
            height="595.3"
          />
        </svg>

        {/* QR Code - Positioned where red box was */}
        {includeQRCode && (
          <div className={styles.qrcodeContainer}>
            <CertificateQRCode
              credentialCode={certificate.credential_code}
              certificateId={certificate.certificate_id}
              size={110}
            />
          </div>
        )}

        {/* Dynamic Text Overlays */}
        <div className={styles.textOverlays}>
          {/* Student Name */}
          <div className={styles.studentName}>
            {certificate.student_name}
          </div>

          {/* Course Name */}
          <div className={styles.courseName}>
            {certificate.course_name}
          </div>

          {/* Grade/Score */}
          {certificate.grade && (
            <div className={styles.gradeInfo}>
              Grade: {certificate.grade}%
            </div>
          )}

          {/* Level */}
          {certificate.level && (
            <div className={styles.levelInfo}>
              Level: {certificate.level}
            </div>
          )}

          {/* Issue Date */}
          <div className={styles.issueDate}>
            {formattedIssueDate}
          </div>

          {/* Expiration Date */}
          {validUntilDate && (
            <div className={styles.expirationDate}>
              Valid Until: {validUntilDate}
            </div>
          )}

          {/* Certificate ID */}
          <div className={styles.certificateId}>
            {certificate.certificate_id}
          </div>

          {/* Credential Code */}
          <div className={styles.credentialCode}>
            {certificate.credential_code}
          </div>

          {/* Instructor Name */}
          {certificate.instructor_name && (
            <div className={styles.instructorName}>
              {certificate.instructor_name}
            </div>
          )}

          {/* Institution */}
          {certificate.institution && (
            <div className={styles.institution}>
              {certificate.institution}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

"use client"

import React, { useState } from 'react';
import Link from "next/link"; 
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import SignInFlow from "@/components/SignInFlow";

export default function LandingPage() {
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowSignInDialog(false);
  };

  const handleShareContent = () => {
    if (isAuthenticated) {
      // Redirect to content sharing
      window.location.href = '/dashboard';
    } else {
      setShowSignInDialog(true);
    }
  };

  return (
    <div className="landing-page">
      {/* Background Image */}
      <div className="background-image"></div>
      
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-text">Rhoda</span>
          </div>
        </div>
        <div className="header-right">
          <Dialog open={showSignInDialog} onOpenChange={setShowSignInDialog}>
            <DialogTrigger asChild>
              <button className="sign-in-button">
                <div className="sign-in-inner">
                  <span className="sign-in-text">Sign In</span>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-transparent border-none p-0 sm:rounded-2xl max-w-md">
              <DialogTitle className="sr-only">Sign In</DialogTitle>
              <SignInFlow onSuccess={handleAuthSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-section">
          <div className="text-section">
            {/* Orange decorative line SVG */}
            <svg className="decorative-line" width="450" height="23" viewBox="0 0 450 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 9.40131C26 6.90132 117 2.03903 440 9.40133C390 9.40133 250 10.1458 180 17.9013" stroke="#F37933" strokeWidth="10" strokeLinejoin="round"/>
            </svg>
            
            <div className="headline-container">
              <h1 className="main-headline">
                <span className="welcome-text">Welcome to</span>
                <span className="rhoda-text">Rhoda</span>
          </h1>
            </div>
            
            <p className="description">
              Simplify content creation, management, and performance tracking  through WhatsApp and web interfaces.
            </p>
            
            <div className="cta-container">
              <button onClick={handleShareContent} className="cta-button">
                <div className="cta-inner">
                  <span className="cta-text">Share your first content</span>
                </div>
          </button>
            </div>
          </div>
        </div>
        
        {/* Right side illustration */}
        <div className="illustration-container">
          <img 
            className="main-illustration"
            src="/illustration.png" 
            alt="Rhoda illustration" 
          />
        </div>

      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <Link href="/discover" className="footer-link">Discover</Link>
          <span className="separator"> | </span>
          <Link href="/pricing" className="footer-link">Pricing</Link>
          <span className="separator"> | </span>
          <Link href="/privacy" className="footer-link">Privacy</Link>
          <span className="separator"> | </span>
          <Link href="/terms" className="footer-link">Terms</Link>
        </div>
        
        <div className="social-icons">
          {/* WhatsApp */}
          <svg className="social-icon" width="28" height="28" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5487 4.25C9.16775 4.25 3.97475 9.25175 3.9725 15.3988C3.971 17.3645 4.505 19.283 5.5175 20.9728L3.875 26.75L10.0122 25.1998C11.7194 26.0928 13.6176 26.5586 15.5442 26.5573H15.5487C21.9297 26.5573 27.1227 21.5548 27.125 15.4078C27.1265 12.4303 25.9235 9.6275 23.7372 7.52075C21.5517 5.41325 18.6455 4.25075 15.5487 4.25ZM15.5487 24.674H15.545C13.8185 24.674 12.125 24.227 10.6475 23.3825L10.295 23.1815L6.6545 24.101L7.6265 20.681L7.39775 20.3308C6.43693 18.8654 5.92545 17.151 5.92625 15.3988C5.9285 10.289 10.2455 6.13325 15.5525 6.13325C18.122 6.134 20.5377 7.09925 22.355 8.8505C24.1722 10.6018 25.172 12.9305 25.1705 15.407C25.1682 20.5168 20.852 24.674 15.548 24.674H15.5487ZM20.8265 17.7328C20.537 17.594 19.115 16.9198 18.8495 16.826C18.5847 16.7338 18.392 16.6858 18.1992 16.9648C18.0072 17.2438 17.4522 17.8715 17.2842 18.0568C17.1147 18.2428 16.946 18.2653 16.6565 18.1265C16.367 17.987 15.4347 17.693 14.3307 16.7435C13.4705 16.0055 12.89 15.0935 12.7212 14.8138C12.5525 14.5355 12.7032 14.3848 12.848 14.246C12.9777 14.1223 13.1375 13.9213 13.2815 13.7585C13.4255 13.5958 13.4735 13.4795 13.571 13.2935C13.667 13.1083 13.619 12.9448 13.5462 12.806C13.4735 12.6658 12.896 11.2948 12.6537 10.7375C12.4197 10.1945 12.1812 10.2673 12.0035 10.2583C11.8347 10.2508 11.6427 10.2485 11.4485 10.2485C11.2572 10.2485 10.943 10.3183 10.6775 10.5973C10.4127 10.8763 9.665 11.5498 9.665 12.9208C9.665 14.2925 10.7015 15.617 10.8462 15.803C10.991 15.9883 12.8862 18.803 15.788 20.0105C16.478 20.2963 17.0165 20.468 17.4372 20.597C18.1302 20.8093 18.761 20.7785 19.259 20.7073C19.814 20.627 20.9705 20.0338 21.2105 19.3835C21.452 18.7333 21.452 18.1753 21.38 18.059C21.3095 17.9428 21.116 17.873 20.8265 17.7328Z" fill="white"/>
          </svg>
          
          {/* X (Twitter) */}
          <svg className="social-icon x-icon" width="18" height="18" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.1138 0H21.6407L13.9356 9.74257L23 23H15.9027L10.3438 14.9594L3.98313 23H0.454179L8.6955 12.5792L0 0H7.27752L12.3023 7.34938L18.1138 0ZM16.876 20.6646H18.8303L6.21564 2.21272H4.11853L16.876 20.6646Z" fill="white"/>
          </svg>
          
          {/* Instagram */}
          <svg className="social-icon" width="28" height="28" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M11.2749 11.2749C12.3954 10.1543 13.9153 9.52475 15.5 9.52475C17.0847 9.52475 18.6046 10.1543 19.7251 11.2749C20.8457 12.3954 21.4752 13.9153 21.4752 15.5C21.4752 17.0847 20.8457 18.6046 19.7251 19.7251C18.6046 20.8457 17.0847 21.4753 15.5 21.4753C13.9153 21.4753 12.3954 20.8457 11.2749 19.7251C10.1543 18.6046 9.52475 17.0847 9.52475 15.5C9.52475 13.9153 10.1543 12.3954 11.2749 11.2749ZM14.0156 19.0836C14.4862 19.2785 14.9906 19.3789 15.5 19.3789C16.5287 19.3789 17.5153 18.9702 18.2428 18.2428C18.9702 17.5154 19.3789 16.5287 19.3789 15.5C19.3789 14.4713 18.9702 13.4847 18.2428 12.7572C17.5153 12.0298 16.5287 11.6211 15.5 11.6211C14.9906 11.6211 14.4862 11.7215 14.0156 11.9164C13.545 12.1113 13.1174 12.397 12.7572 12.7572C12.397 13.1174 12.1113 13.545 11.9164 14.0156C11.7215 14.4862 11.6211 14.9906 11.6211 15.5C11.6211 16.0094 11.7215 16.5138 11.9164 16.9844C12.1113 17.455 12.397 17.8826 12.7572 18.2428C13.1174 18.603 13.545 18.8887 14.0156 19.0836Z" fill="white"/>
            <path d="M22.7999 10.415C23.0648 10.1501 23.2136 9.79086 23.2136 9.41625C23.2136 9.04165 23.0648 8.68239 22.7999 8.41751C22.535 8.15263 22.1757 8.00382 21.8011 8.00382C21.4265 8.00382 21.0673 8.15263 20.8024 8.41751C20.5375 8.68239 20.3887 9.04165 20.3887 9.41625C20.3887 9.79086 20.5375 10.1501 20.8024 10.415C21.0673 10.6799 21.4265 10.8287 21.8011 10.8287C22.1757 10.8287 22.535 10.6799 22.7999 10.415Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M10.7074 3.94475C11.9474 3.88818 12.3427 3.875 15.5 3.875C18.6581 3.875 19.0526 3.88895 20.2918 3.94475C21.5295 4.00133 22.3758 4.19895 23.1151 4.48492C23.8905 4.77699 24.593 5.23452 25.1735 5.82568C25.7649 6.4064 26.2224 7.10912 26.5143 7.88485C26.8018 8.6242 26.9987 9.46973 27.0553 10.7074C27.1118 11.9474 27.125 12.3427 27.125 15.5C27.125 18.6574 27.1118 19.0526 27.0553 20.2926C26.9987 21.5303 26.8018 22.3758 26.5151 23.1151C26.223 23.8905 25.7655 24.593 25.1743 25.1735C24.5931 25.7657 23.8902 26.2229 23.1151 26.5143C22.3758 26.8018 21.5303 26.9987 20.2926 27.0553C19.0526 27.1118 18.6574 27.125 15.5 27.125C12.3427 27.125 11.9474 27.1118 10.7074 27.0553C9.46973 26.9987 8.6242 26.8018 7.88485 26.5151C7.10947 26.223 6.40704 25.7655 5.82645 25.1743C5.23435 24.5931 4.7771 23.8902 4.4857 23.1151C4.19818 22.3758 4.00133 21.5303 3.94475 20.2926C3.88818 19.0526 3.875 18.6581 3.875 15.5C3.875 12.3419 3.88895 11.9474 3.94475 10.7082C4.00133 9.4705 4.19895 8.6242 4.48492 7.88485C4.77699 7.10946 5.23452 6.40703 5.82568 5.82645C6.40693 5.23435 7.10985 4.7771 7.88485 4.4857C8.6242 4.19818 9.46973 4.00133 10.7074 3.94475ZM20.198 6.03725C18.972 5.98145 18.6039 5.96982 15.5 5.96982C12.3961 5.96982 12.028 5.98145 10.802 6.03725C9.6689 6.08917 9.05355 6.27828 8.64358 6.43792C8.13859 6.62391 7.68175 6.92078 7.3067 7.3067C6.9006 7.71357 6.64795 8.10107 6.43792 8.64358C6.2775 9.05355 6.08917 9.6689 6.03725 10.802C5.98145 12.028 5.96982 12.3961 5.96982 15.5C5.96982 18.6039 5.98145 18.972 6.03725 20.198C6.08917 21.3311 6.27828 21.9465 6.43792 22.3564C6.62402 22.8613 6.92089 23.3182 7.3067 23.6933C7.6818 24.0792 8.13863 24.376 8.64358 24.5621C9.05355 24.7225 9.6689 24.9108 10.802 24.9627C12.028 25.0185 12.3954 25.0302 15.5 25.0302C18.6047 25.0302 18.972 25.0185 20.198 24.9627C21.3311 24.9108 21.9465 24.7217 22.3564 24.5621C22.8614 24.3761 23.3183 24.0792 23.6933 23.6933C24.0792 23.3182 24.376 22.8614 24.5621 22.3564C24.7225 21.9465 24.9108 21.3311 24.9627 20.198C25.0185 18.972 25.0302 18.6039 25.0302 15.5C25.0302 12.3961 25.0185 12.028 24.9627 10.802C24.9108 9.6689 24.7217 9.05355 24.5621 8.64358C24.3521 8.10107 24.1002 7.71357 23.6933 7.3067C23.2864 6.9006 22.8989 6.64795 22.3564 6.43792C21.9465 6.2775 21.3311 6.08917 20.198 6.03725Z" fill="white"/>
          </svg>
          
          {/* TikTok */}
          <svg className="social-icon" width="28" height="28" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.3993 7.51117C22.0077 6.63314 21.0034 5.22827 20.6901 3.59058C20.6224 3.23674 20.5852 2.87259 20.5852 2.5H16.1439L16.1368 19.725C16.0621 21.6538 14.4217 23.202 12.4106 23.202C11.7855 23.202 11.197 23.0508 10.6788 22.7869C9.49047 22.1817 8.67724 20.9763 8.67724 19.5891C8.67724 17.5969 10.3521 15.976 12.4106 15.976C12.7948 15.976 13.1635 16.0374 13.5122 16.1431V11.7553C13.1513 11.7078 12.7847 11.678 12.4106 11.678C7.903 11.678 4.23596 15.2269 4.23596 19.5891C4.23596 22.2655 5.61773 24.634 7.72576 26.0662C9.05358 26.9683 10.6687 27.5 12.4106 27.5C16.9182 27.5 20.5852 23.9513 20.5852 19.5891V10.8546C22.3271 12.0645 24.4613 12.7775 26.7641 12.7775V8.47949C25.5236 8.47949 24.3683 8.1226 23.3993 7.51117Z" fill="white"/>
          </svg>
        </div>
      </footer>

      <style jsx>{`
        .landing-page {
          width: 100vw;
          height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .background-image {
          width: 100vw;
          height: 100vh;
          position: absolute;
          left: 0;
          top: 0;
          background-image: url('/background.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .header {
          display: flex;
          width: 100%;
          padding: 24px 80px;
          justify-content: space-between;
          align-items: center;
          position: absolute;
          left: 0;
          top: 0;
          height: 96px;
          z-index: 10;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 48px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .logo-text {
          color: #FFF;
          font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;
          font-size: 32px;
          font-weight: 700;
          line-height: 110%;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sign-in-button {
          display: flex;
          padding: 12px;
          justify-content: center;
          align-items: center;
          border-radius: 8px;
          border: 2px solid #FFF;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          animation: buttonSlideIn 1s ease-out 1s both;
        }

        @keyframes buttonSlideIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sign-in-button:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }

        .sign-in-button:active {
          transform: scale(0.95);
          animation: buttonPop 0.6s ease-out;
        }

        @keyframes buttonPop {
          0% { transform: scale(0.95); }
          40% { transform: scale(1.1); }
          70% { transform: scale(1.1); }
          100% { transform: scale(1.05); }
        }

        .sign-in-inner {
          display: flex;
          padding: 0 16px;
          justify-content: center;
          align-items: center;
        }

        .sign-in-text {
          color: #FFF;
          font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 24px;
          letter-spacing: 0.5px;
        }

        .main-content {
          display: flex;
          width: 100%;
          position: absolute;
          left: 0;
          top: 0;
          height: 100vh;
          z-index: 5;
          align-items: center;
          justify-content: space-between;
          padding: 0 200px;
          gap: 30px;
          animation: fadeIn 1.5s ease-in;
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .content-section {
          display: flex;
          width: 500px;
          justify-content: flex-start;
          align-items: center;
          position: relative;
          left: 0;
          height: auto;
          flex-shrink: 0;
        }

        .text-section {
          display: flex;
          width: 100%;
          flex-direction: column;
          align-items: flex-start;
          gap: 24px;
          flex-shrink: 0;
          position: relative;
          left: 0;
          top: 0;
          height: auto;
        }

        .decorative-line {
          width: 220px;
          height: 12px;
          position: absolute;
          left: 5px;
          top: 155px;
          stroke-width: 10px;
          stroke: #F37933;
          animation: drawLine 2s ease-in-out;
        }

        @keyframes drawLine {
          0% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          100% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }

        .headline-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          align-self: stretch;
        }

        .main-headline {
          align-self: stretch;
          font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;
          font-size: 72px;
          font-style: normal;
          font-weight: 800;
          line-height: 110%;
          margin: 0;
          animation: slideInFromLeft 1s ease-out;
        }

        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .welcome-text {
          color: #FFF;
          font-weight: 700;
          display: block;
        }

        .rhoda-text {
          color: #F3C80F;
          font-weight: 700;
          display: block;
        }

        .description {
          align-self: stretch;
          color: #FFF;
          font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
          font-size: 20px;
          font-style: normal;
          font-weight: 400;
          line-height: 30px;
          margin: 0;
          animation: fadeInUp 1.5s ease-out 0.5s both;
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cta-container {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .cta-button {
          display: flex;
          padding: 20px 24px;
          justify-content: center;
          align-items: center;
          border-radius: 8px;
          border: 2px solid #F37933;
          background: #F37933;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          animation: ctaButtonSlideIn 1s ease-out 1.2s both;
        }

        @keyframes ctaButtonSlideIn {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .cta-button:hover {
          background: #e66a2a;
          border-color: #e66a2a;
          transform: scale(1.05);
        }

        .cta-button:active {
          transform: scale(0.95);
          animation: ctaButtonPop 0.7s ease-out;
        }

        @keyframes ctaButtonPop {
          0% { transform: scale(0.95); }
          25% { transform: scale(1.15); }
          50% { transform: scale(1.15); }
          75% { transform: scale(1.02); }
          100% { transform: scale(1.05); }
        }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .cta-button:hover::before {
          left: 100%;
        }

        .cta-inner {
          display: flex;
          padding: 0 24px;
          justify-content: center;
          align-items: center;
        }

        .cta-text {
          color: #FFF;
          font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;
          font-size: 24px;
          font-style: normal;
          font-weight: 700;
          line-height: 24px;
          letter-spacing: 0.5px;
        }

        .illustration-container {
          position: relative;
          right: 0;
          top: 0;
          transform: none;
          width: 650px;
          height: 650px;
          flex-shrink: 0;
          animation: slideInFromRight 1.2s ease-out, float 3s ease-in-out infinite;
        }

        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }



        .main-illustration {
          width: 650px;
          height: 650px;
          flex-shrink: 0;
          aspect-ratio: 1/1;
        }

        .footer {
          width: calc(100% - 160px);
          height: 31px;
          flex-shrink: 0;
          position: absolute;
          left: 80px;
          bottom: 80px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }

        .footer-links {
          color: #FFF;
          text-align: center;
          font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
          font-size: 20px;
          font-style: normal;
          font-weight: 400;
          line-height: 24px;
          display: flex;
          align-items: center;
        }

        .footer-link {
          color: #FFF;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          padding: 4px 8px;
        }

        .footer-link:hover {
          opacity: 0.8;
          transform: translateY(-2px);
          color: #F3C80F;
        }

        .footer-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: #F3C80F;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }

        .footer-link:hover::after {
          width: 80%;
        }

        .separator {
          color: #FFF;
          margin: 0 8px;
        }

        .social-icons {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .social-icon {
          width: 31px;
          height: 31px;
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .social-icon:hover {
          opacity: 0.8;
          transform: scale(1.2) rotate(5deg);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .x-icon {
          margin-top: 5px;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 1200px) {
          .content-section {
            left: 60px;
            width: 450px;
          }

          .text-section {
            width: 450px;
          }

          .illustration-container {
            right: 60px;
            width: 500px;
            height: 500px;
          }

          .main-illustration {
            width: 500px;
            height: 500px;
          }
        }

        @media (max-width: 1024px) {
          .content-section {
            left: 40px;
            width: 400px;
          }

          .text-section {
            width: 400px;
          }

          .illustration-container {
            right: 40px;
            width: 450px;
            height: 450px;
          }

          .main-illustration {
            width: 450px;
            height: 450px;
          }

          .footer {
            left: 40px;
            right: 40px;
            width: calc(100% - 80px);
          }
        }

        @media (max-width: 768px) {
          .landing-page {
            height: auto;
            min-height: 100vh;
          }

          .header {
            padding: 12px 16px;
            position: relative;
            height: auto;
          }

          .main-content {
            flex-direction: column;
            padding: 16px;
            gap: 24px;
            position: relative;
            top: 0;
            height: auto;
            min-height: auto;
          }

          .content-section {
            position: relative;
            left: 0;
            width: 100%;
            height: auto;
            top: 0;
          }

          .text-section {
            width: 100%;
            height: auto;
            position: relative;
            gap: 24px;
          }

          .main-headline {
            font-size: 48px;
            line-height: 1.1;
          }

          .description {
            font-size: 16px;
            line-height: 24px;
          }

          .cta-button {
            padding: 14px 18px;
            width: 100%;
            max-width: 340px;
          }

          .cta-text {
            font-size: 18px;
          }

          .decorative-line {
            width: 120px;
            left: 0px;
            top: 120px;
          }

          .illustration-container {
            position: relative;
            left: 0;
            right: 0;
            transform: none;
            top: 0;
            width: 100%;
            height: 260px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .main-illustration {
            width: 260px;
            height: 260px;
          }

          .footer {
            position: relative;
            left: 0;
            right: 0;
            width: 100%;
            bottom: 0;
            flex-direction: column;
            gap: 16px;
            height: auto;
            padding: 20px;
          }

          .footer-links {
            text-align: center;
            font-size: 14px;
          }

          .social-icons {
            justify-content: center;
          }

          /* Center and tighten content for mobile */
          .text-section { align-items: center; text-align: center; gap: 20px; }
          .headline-container { align-items: center; }
          .description { max-width: 90vw; margin: 0 auto; }
          .cta-container { justify-content: center; width: 100%; }
          .content-section { padding: 0 8px; }
          .decorative-line { left: 50%; transform: translateX(-50%); top: 118px; }
          .main-illustration { max-width: 70vw; max-height: 70vw; }
        }

        @media (max-width: 480px) {
          .header {
            padding: 12px 16px;
          }

          .logo-text {
            font-size: 24px;
          }

          .sign-in-button {
            padding: 8px;
          }

          .sign-in-inner {
            padding: 0 12px;
          }

          .sign-in-text {
            font-size: 14px;
          }

          .main-content {
            padding: 12px;
            gap: 20px;
          }

          .main-headline {
            font-size: 34px;
          }

          .description {
            font-size: 14px;
            line-height: 20px;
            br {
              display: none;
            }
          }

          .cta-button {
            padding: 12px 16px;
            width: 100%;
            max-width: 280px;
          }

          .cta-text {
            font-size: 16px;
          }

          .decorative-line {
            width: 100px;
            top: 110px;
          }

          .illustration-container {
            height: 230px;
          }

          .main-illustration {
            width: 230px;
            height: 230px;
          }

          .footer {
            padding: 16px;
          }

          .footer-links {
            font-size: 14px;
            flex-wrap: wrap;
            gap: 8px;
          }

          .separator {
            display: none;
          }

          .footer-link {
            display: inline-block;
            margin: 4px 8px;
          }

          .social-icons {
            gap: 12px;
          }

          .social-icon {
            width: 24px;
            height: 24px;
          }
          /* Extra small tweaks */
          .text-section { gap: 18px; }
          .headline-container { align-items: center; }
          .description { max-width: 92vw; margin: 0 auto; }
          .decorative-line { width: 120px; left: 50%; transform: translateX(-50%); top: 115px; }
          .main-illustration { max-width: 75vw; max-height: 75vw; }
        }

        @media (max-width: 390px) {
          .main-headline { font-size: 32px; }
          .description { font-size: 14px; line-height: 22px; }
          .cta-button { max-width: 260px; }
        }
      `}</style>
    </div>
  );
}

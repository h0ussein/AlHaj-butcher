import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/auth/verify-email/${token}`);
        if (res.ok) {
          setStatus('success');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setStatus('error');
        }
      } catch (e) {
        setStatus('error');
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8 text-center">
      {status === 'loading' && <p>Verifying your email...</p>}
      {status === 'success' && <p>Your email has been verified. Redirecting to login...</p>}
      {status === 'error' && <p>Invalid or expired verification link.</p>}
    </div>
  );
};

export default VerifyEmailPage;



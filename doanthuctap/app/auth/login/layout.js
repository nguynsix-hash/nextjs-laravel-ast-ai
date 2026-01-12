// File: /app/(auth)/login/layout.js

export default function LoginLayout({ children }) {
  return (
    // XÓA thẻ <html> và <body>. 
    // Layout con chỉ nên là một wrapper <div>.
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Component page.js (trang Login) sẽ được render tại đây */}
      {children} 
    </div>
  );
}
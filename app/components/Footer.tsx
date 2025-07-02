"use client";

const Footer = () => {
  return (
    <footer className="bg-neutral-800">
      <div className="border-t border-neutral-700 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} TrendSage. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

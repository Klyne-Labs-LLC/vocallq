const Footer = () => {
  return (
    <footer className="mt-20 border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="px-3 py-1 flex justify-center text-bold items-center rounded-lg bg-background border border-border text-primary">
              VocallQ
            </div>
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              AI-powered webinar platform for maximum conversions
            </p>
          </div>

          {/* Company Info */}
          <div className="flex flex-col items-center sm:items-end gap-1 text-xs text-muted-foreground">
            <p>© 2025 Klyne Labs, LLC</p>
            <p>All rights reserved</p>
            <p className="text-center sm:text-right">
              131 Continental Dr, Suite 305<br />
              Newark, DE 19713
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
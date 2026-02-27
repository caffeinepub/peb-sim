import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Loader2, Building2, Shield, Zap, BarChart3 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, isInitializing } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === 'User is already authenticated') {
        navigate({ to: '/' });
      }
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Blueprint background */}
      <div className="absolute inset-0 blueprint-bg opacity-30" />
      <div className="absolute inset-0 grid-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/peb-sim-logo.dim_256x256.png"
              alt="PEB-Sim"
              className="w-10 h-10 object-contain"
            />
            <span className="font-mono font-bold text-xl text-amber tracking-widest">
              PEB<span className="text-foreground/50">-</span>SIM
            </span>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Hero text */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/20 rounded-sm px-3 py-1">
                  <span className="w-2 h-2 rounded-full bg-amber animate-pulse-amber" />
                  <span className="font-mono text-xs text-amber uppercase tracking-wider">
                    3D Erection Simulation
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Pre-Engineered
                  <br />
                  <span className="text-amber">Building Sim</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Upload DXF drawings and generate interactive 3D timelapse simulations of the building erection process.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {[
                  { icon: Building2, text: 'Parse DXF files with layer-based element detection' },
                  { icon: Zap, text: 'Interactive 3D timeline with fly-in animations' },
                  { icon: BarChart3, text: 'Step-by-step erection sequence visualization' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-6 h-6 rounded-sm bg-amber/10 border border-amber/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3 h-3 text-amber" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Login card */}
            <div className="steel-card p-8 space-y-6 amber-glow">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-sm bg-amber/10 border border-amber/30 flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-amber" />
                </div>
                <h2 className="font-mono font-bold text-xl text-foreground">Sign In</h2>
                <p className="text-muted-foreground text-sm">
                  Authenticate securely with Internet Identity
                </p>
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full bg-amber text-primary-foreground hover:bg-amber-light font-mono font-semibold text-base py-6 gap-3"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Sign In with Internet Identity
                  </>
                )}
              </Button>

              <div className="border-t border-border pt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Secured by the Internet Computer Protocol.
                  <br />
                  No passwords required.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 p-6 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            Built with <span className="text-amber mx-1">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'peb-sim')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber hover:text-amber-light transition-colors ml-1"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

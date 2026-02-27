import { ReactNode } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Building2, LayoutDashboard, CreditCard, Settings } from 'lucide-react';
import ProfileSetupModal from './ProfileSetupModal';
import StripeSetupPanel from './StripeSetupPanel';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { identity, clear, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Redirect to login if not authenticated
  if (!isInitializing && !isAuthenticated) {
    navigate({ to: '/login' });
    return null;
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/assets/generated/peb-sim-logo.dim_256x256.png"
                alt="PEB-Sim"
                className="w-8 h-8 object-contain"
              />
              <span className="font-mono font-semibold text-lg text-amber tracking-wider">
                PEB<span className="text-foreground/60">-</span>SIM
              </span>
            </button>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/' })}
                className="text-muted-foreground hover:text-foreground gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/pricing' })}
                className="text-muted-foreground hover:text-foreground gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Pricing
              </Button>
            </nav>

            {/* User info + logout */}
            <div className="flex items-center gap-3">
              {userProfile && (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-7 h-7 rounded-sm bg-amber/20 border border-amber/30 flex items-center justify-center">
                    <span className="text-amber text-xs font-mono font-semibold">
                      {userProfile.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground font-mono">
                    {userProfile.displayName}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber/60" />
              <span className="font-mono">PEB-SIM</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-1">
              Built with{' '}
              <span className="text-amber mx-1">♥</span>
              {' '}using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'peb-sim')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber hover:text-amber-light transition-colors"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Profile setup modal */}
      {showProfileSetup && <ProfileSetupModal />}

      {/* Stripe setup panel (admin only) */}
      <StripeSetupPanel />
    </div>
  );
}

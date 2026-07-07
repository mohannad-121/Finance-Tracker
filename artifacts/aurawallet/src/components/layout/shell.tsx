import { ReactNode, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';
import { seedData } from '@/lib/data';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'wouter';

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [location] = useLocation();

  useEffect(() => {
    seedData();
  }, []);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <Sidebar />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0 px-4 md:px-8 pt-6 md:pt-8 scroll-smooth">
          <div className="max-w-6xl mx-auto w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

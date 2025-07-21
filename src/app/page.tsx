'use client'
import React, { useEffect, useState } from "react";
import { potentialCustomer } from "@/lib/data";
import { Upload, Webcam } from "lucide-react";
import Image from "next/image";
import UserInfoCard from "@/components/ReusableComponent/UserInfoCard";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from 'lucide-react';
import PurpleIcon from "@/components/ReusableComponent/PurpleIcon";
import LightningIcon from '@/icons/LightningIcon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { sidebarData, onBoardingSteps } from '@/lib/data';
import { UserButton } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { usePathname } from 'next/navigation';
import Footer from '@/components/ReusableComponent/Footer';

const LandingPageSidebar = ({ onAuthRequired }: { onAuthRequired: () => void }) => {
  const pathname = usePathname();

  return (
    <div className="w-18 sm:w-24 h-screen fixed top-0 left-0 bottom-0 py-10 px-2 sm:px-6 border-r bg-background border-border flex flex-col items-center justify-start gap-10 z-50">
      <div className="">
        <Image src="/logo.svg" alt="VocallQ Logo" width={56} height={56} />
      </div>
      {/* Sidebar Menu */}
      <div className="w-full h-full justify-between items-center flex flex-col">
        <div className="w-full h-fit flex flex-col gap-4 items-center justify-center">
          {sidebarData.map((item) => (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    onClick={onAuthRequired}
                    className={`flex items-center gap-2 cursor-pointer rounded-lg p-2 hover:bg-secondary/50 transition-colors
                    ${pathname === '/' && item.title === 'Home' ? 'iconBackground' : ''}`}
                  >
                    <item.icon
                      className={`w-4 h-4 ${pathname === '/' && item.title === 'Home' ? '' : 'opacity-80'}`}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="text-sm">{item.title}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <div onClick={onAuthRequired} className="cursor-pointer">
          <UserButton 
            appearance={{
              baseTheme: dark,
              elements: {
                avatarBox: "w-10 h-10",
                userButtonPopoverCard: "bg-card border border-border shadow-lg dark:bg-card dark:border-border",
                userButtonPopoverActionButton: "text-card-foreground hover:bg-accent dark:text-card-foreground dark:hover:bg-accent",
                userButtonPopoverActionButtonText: "text-card-foreground dark:text-card-foreground",
                userButtonPopoverActionButtonIcon: "text-card-foreground dark:text-card-foreground",
                userButtonPopoverFooter: "bg-card border-t border-border dark:bg-card dark:border-border"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border border-border bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary text-center">
            Welcome to VocallQ
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground mt-4">
            To access this feature and start maximizing your webinar conversions, 
            please sign in to your account or create a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={handleSignIn}
            className="w-full text-lg py-6"
          >
            Sign In to Continue
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AuthPromptFeatureCard = ({
  Icon,
  heading,
  onAuthRequired
}: {
  Icon: React.ReactNode;
  heading: string;
  onAuthRequired: () => void;
}) => {
  return (
    <div 
      onClick={onAuthRequired}
      className='px-8 py-6 flex flex-col items-start justify-center gap-14 rounded-xl border border-border bg-secondary backdrop-blur-xl cursor-pointer hover:bg-secondary/80 transition-colors'
    >
      {Icon}
      <p className='font-semibold text-xl text-primary'>{heading}</p>
    </div>
  );
};

const AuthPromptFeatureSectionLayout = ({ 
  children, 
  heading,
  onAuthRequired
}: { 
  children: React.ReactNode; 
  heading: string;
  onAuthRequired: () => void;
}) => {
  return (
    <div className="p-10 flex items-center justify-between flex-col gap-10 border rounded-3xl border-border bg-background-10">
      {children}
      <div className="w-full justify-between items-center flex flex-wrap gap-10">
        <h3 className="sm:w-[70%] font-semibold text-3xl text-primary">
          {heading}
        </h3>
        <div 
          onClick={onAuthRequired}
          className="text-primary font-semibold text-lg flex items-center justify-center rounded-md opacity-50 cursor-pointer hover:opacity-70 transition-opacity"
        >
          View <ArrowRight className="ml-2 w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const AuthPromptOnBoarding = ({ onAuthRequired }: { onAuthRequired: () => void }) => {
  // Mock the status - all steps are pending for unauthenticated users
  const getStepStatus = (index: number): 'completed' | 'current' | 'pending' => {
    // For landing page, we'll show the first step as current and others as pending
    return index === 0 ? 'current' : 'pending'
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-xl">
      {onBoardingSteps.map((step, index) => {
        const stepStatus = getStepStatus(index)

        return (
          <div
            key={step.id}
            onClick={onAuthRequired}
            className={`
              flex items-center gap-3 p-3 rounded-md transition-colors cursor-pointer
              ${
                stepStatus === 'completed'
                  ? 'bg-muted/30 hover:bg-muted/50'
                  : stepStatus === 'current'
                    ? 'bg-primary/5 hover:bg-primary/10'
                    : 'hover:bg-muted/30'
              }
            `}
          >
            {/* Status Indicator */}
            <div
              className={`
              w-6 h-6 rounded-full flex items-center justify-center
              ${
                stepStatus === 'completed'
                  ? 'bg-[#a76ef6] text-primary'
                  : stepStatus === 'current'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
              }
            `}
            >
              {stepStatus === 'completed' ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-xs font-medium">{step.id}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={`
                text-sm font-medium truncate
                ${
                  stepStatus === 'completed'
                    ? 'text-primary'
                    : stepStatus === 'current'
                      ? 'text-primary'
                      : 'text-foreground'
                }
              `}
              >
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {step.description}
              </p>
            </div>

            {/* Arrow */}
            <ArrowRight
              className={`
              w-4 h-4 flex-shrink-0
              ${
                stepStatus === 'completed'
                  ? 'text-primary'
                  : stepStatus === 'current'
                    ? 'text-primary'
                    : 'text-muted-foreground'
              }
            `}
            />
          </div>
        )
      })}
    </div>
  )
};

const LandingPageHeader = ({ onAuthRequired }: { onAuthRequired: () => void }) => {
  return (
    <div className="w-full p-4 sticky top-5 z-10 flex justify-between items-center flex-wrap gap-4 border border-border/40 backdrop-blur-2xl rounded-full">
      <div className="px-4 py-2 flex justify-center text-bold items-center rounded-xl bg-background border border-border text-primary capitalize">
        VocallQ
      </div>

      <div className="flex gap-6 items-center flex-wrap">
        <PurpleIcon>
          <LightningIcon />
        </PurpleIcon>
        <Button onClick={onAuthRequired}>
          Get Started
        </Button>
      </div>
    </div>
  );
};


export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/home');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  if (isLoaded && isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed sidebar */}
      <LandingPageSidebar onAuthRequired={handleAuthRequired} />

      {/* Main content area with left margin for sidebar */}
      <div style={{ marginLeft: '6rem' }} className="sm:ml-32 flex-1">
        <div className="flex flex-col w-full min-h-screen px-4 scrollbar-hide container mx-auto">
          {/* Fixed header */}
          <LandingPageHeader onAuthRequired={handleAuthRequired} />
          {/* Scrollable content area with increased bottom padding */}
          <div className="flex-1 py-10">
            <div className="w-full mx-auto h-full">
              <div className="w-full flex flex-col sm:flex-row justify-between items-start gap-14">
                <div className="space-y-6">
                  <h2 className="text-primary font-semibold text-4xl">
                    Get maximum Conversion from your webinars
                  </h2>
                  <AuthPromptOnBoarding onAuthRequired={handleAuthRequired} />
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 place-content-center">
                  <AuthPromptFeatureCard
                    Icon={<Upload className="w-10 h-10" />}
                    heading="Browse or drag a pre-recorded webinar file"
                    onAuthRequired={handleAuthRequired}
                  />
                  <AuthPromptFeatureCard
                    Icon={<Webcam className="w-10 h-10" />}
                    heading="Browse or drag a pre-recorded webinar file"
                    onAuthRequired={handleAuthRequired}
                  />
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl bg-background-10">
                <AuthPromptFeatureSectionLayout
                  heading="See how far along are your potential customers"
                  onAuthRequired={handleAuthRequired}
                >
                  <div className="p-5 flex flex-col gap-4 items-start border rounded-xl border-border backdrop-blur-3xl">
                    <div className="w-full flex justify-between items-center gap-3">
                      <p className="text-primary font-semibold text-sm">Conversions</p>
                      <p className="text-xs text-muted-foreground font-normal">50</p>
                    </div>
                    <div className="flex flex-col gap-4 items-start">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Image
                          src="/featurecard.png"
                          alt="Info-card"
                          width={250}
                          height={250}
                          className="w-full h-full object-cover rounded-xl"
                          key={index}
                        />
                      ))}
                    </div>
                  </div>
                </AuthPromptFeatureSectionLayout>
                <AuthPromptFeatureSectionLayout
                  heading="See the list of your current customers"
                  onAuthRequired={handleAuthRequired}
                >
                  <div className="flex gap-4 items-center h-full w-full justify-center relative flex-wrap">
                    {potentialCustomer.slice(0, 2).map((customer, index) => (
                      <UserInfoCard customer={customer} tags={customer.tags} key={index} />
                    ))}
                    <Image
                      src={"/glowCard.png"}
                      alt="Info-card"
                      width={350}
                      height={350}
                      className="object-cover rounded-xl absolute px-5 mb-28 hidden sm:flex backdrop-blur-[20px]"
                    />
                  </div>
                </AuthPromptFeatureSectionLayout>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ paddingLeft: '6rem' }} className="sm:pl-32">
        <Footer />
      </div>
      
      <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />
    </div>
  );
}

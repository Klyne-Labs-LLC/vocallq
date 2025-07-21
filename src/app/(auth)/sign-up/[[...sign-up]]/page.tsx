import { SignUp } from '@clerk/nextjs'
import React from 'react'
import Image from 'next/image'
import PurpleIcon from '@/components/ReusableComponent/PurpleIcon'
import LightningIcon from '@/icons/LightningIcon'

export default function Page() {
  return (
    <div className="w-full min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background via-background/95 to-primary/5 border-r border-border/40 flex-col justify-center items-center p-12">
        <div className="max-w-md text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image src="/logo.svg" alt="VocallQ Logo" width={100} height={100} />
          </div>
          
          {/* Brand Name */}
          <div className="px-6 py-3 flex justify-center text-bold items-center rounded-2xl bg-background border border-border text-primary text-2xl font-bold">
            VocallQ
          </div>
          
          {/* Tagline */}
          <h1 className="text-3xl font-bold text-primary leading-tight">
            Start maximizing your webinar conversions today
          </h1>
          
          {/* Value Props */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <PurpleIcon size="sm">
                <LightningIcon className="w-4 h-4" />
              </PurpleIcon>
              <span className="text-muted-foreground">Setup in under 15 minutes</span>
            </div>
            <div className="flex items-center gap-3">
              <PurpleIcon size="sm">
                <LightningIcon className="w-4 h-4" />
              </PurpleIcon>
              <span className="text-muted-foreground">25% average conversion improvement</span>
            </div>
            <div className="flex items-center gap-3">
              <PurpleIcon size="sm">
                <LightningIcon className="w-4 h-4" />
              </PurpleIcon>
              <span className="text-muted-foreground">Automated lead follow-up</span>
            </div>
          </div>
          
          {/* Social Proof */}
          <div className="bg-background/50 border border-border/30 rounded-xl p-6">
            <p className="text-sm text-muted-foreground italic">
              &ldquo;VocallQ transformed our webinar ROI. We&rsquo;re converting 3x more leads with half the manual effort.&rdquo;
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              — Sarah Chen, Marketing Director
            </p>
          </div>
          
          {/* Company Info */}
          <div className="text-xs text-muted-foreground pt-8 border-t border-border/30">
            © 2025 Klyne Labs, LLC
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex flex-col items-center gap-4">
              <Image src="/logo.svg" alt="VocallQ Logo" width={72} height={72} />
              <div className="px-4 py-2 flex justify-center text-bold items-center rounded-xl bg-background border border-border text-primary text-xl font-bold">
                VocallQ
              </div>
            </div>
          </div>
          
          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">Create your account</h2>
            <p className="text-muted-foreground">Join thousands maximizing their webinar conversions</p>
          </div>
          
          {/* Clerk Sign Up Component */}
          <div className="flex justify-center">
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-background border border-border/40 shadow-lg",
                  headerTitle: "text-primary",
                  headerSubtitle: "text-muted-foreground",
                  formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                  formFieldInput: "bg-background border-border text-foreground",
                  footerActionLink: "text-primary hover:text-primary/80"
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
